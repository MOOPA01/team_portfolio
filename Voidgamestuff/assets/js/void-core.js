// =============================================================
//  V.O.I.D.EXE  —  void-core.js  (ES Module)
// =============================================================

// ─── GRID CONSTANTS (exported for use in level files) ────────
export const CELL = 32;
export const COLS = 22;
export const ROWS = 16;
export const W    = COLS * CELL;
export const H    = ROWS * CELL;

// ─── LEVEL REGISTRY ──────────────────────────────────────────
export const LEVELS = [];
export function registerLevel(levelData) { LEVELS.push(levelData); }

// ─── WALL UTILITIES (exported for level files) ───────────────
export function buildBorderWalls(cols, rows) {
  const w = [];
  for (let x = 0; x < cols; x++) {
    w.push({x, y: 0}); w.push({x, y: rows - 1});
  }
  for (let y = 1; y < rows - 1; y++) {
    w.push({x: 0, y}); w.push({x: cols - 1, y});
  }
  return w;
}

export function rectWall(x, y, w, h) {
  const cells = [];
  for (let row = y; row < y + h; row++)
    for (let col = x; col < x + w; col++)
      cells.push({x: col, y: row});
  return cells;
}

// ─── MODULE-PRIVATE ENGINE STATE ─────────────────────────────
let canvas, ctx;
let level = 0, deaths = 0, totalCoins = 0;
let player, enemies, coins, wallSet, wallBarriers, goalRect;
let dead = false, levelWon = false, deathTimer = 0, winFlash = 0;
let running = false, particles = [], t = 0;
let runStartTime = 0, timerActive = false;
let csQueue = [], csIndex = 0, csOnComplete = null;
let _onEndingCutscene = null, _introScenes = null;

// ─── PRIVATE WALL HELPERS ────────────────────────────────────
function buildWallSet(walls) {
  return new Set(walls.map(w => `${w.x},${w.y}`));
}
function isWall(px, py) {
  return wallSet.has(`${Math.floor(px / CELL)},${Math.floor(py / CELL)}`);
}
function buildBarriers(walls) {
  return walls.map(w => ({
    x: w.x * CELL, y: w.y * CELL, width: CELL, height: CELL,
    color: 'rgba(34,34,34,1)', stroke: 'rgba(68,68,68,0.8)',
    visible: true, hitbox: { widthPercentage: 1.0, heightPercentage: 1.0 }
  }));
}

// ─── COIN CLASS ──────────────────────────────────────────────
class Coin {
  constructor(data) {
    this.x = data.x; this.y = data.y; this.r = data.r || 6;
    this.value = Number(data.value ?? 1);
    this.collected = false; this.collectCount = 0;
    this.collectCooldownUntil = 0;
    this.color = data.color || '#FFD700';
    this.strokeColor = data.stroke || '#B8860B';
    this.pulse = data.pulse || (Math.random() * Math.PI * 2);
  }
  draw() {
    if (this.collected) return;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color; ctx.fill();
    ctx.strokeStyle = this.strokeColor; ctx.lineWidth = 2; ctx.stroke();
  }
  collect() {
    if (performance.now() < this.collectCooldownUntil) return false;
    this.collected = true; this.collectCount++;
    this.collectCooldownUntil = performance.now() + 200;
    totalCoins++;
    spawnParticles(this.x, this.y, this.color, 12);
    updateHUD(); return true;
  }
  checkPlayerCollision(px, py, pr) {
    if (this.collected || performance.now() < this.collectCooldownUntil) return false;
    const dx = px - this.x, dy = py - this.y;
    return Math.sqrt(dx*dx + dy*dy) < pr + this.r + 2;
  }
}

// ─── PLAYER CONTROLLER ───────────────────────────────────────
class PlayerController {
  constructor(data) {
    this.keypress = data.keypress || {
      up:'ArrowUp', left:'ArrowLeft', down:'ArrowDown', right:'ArrowRight',
      upAlt:'w', leftAlt:'a', downAlt:'s', rightAlt:'d',
      upAlt2:'W', leftAlt2:'A', downAlt2:'S', rightAlt2:'D',
    };
    this.x = data.x; this.y = data.y; this.r = data.r || 10;
    this.xVelocity = data.speed || 3.2; this.yVelocity = data.speed || 3.2;
    this.velocity = {x:0, y:0}; this.pressedKeys = {};
    this.moved = false; this.direction = 'down';
    this.gravity = data.gravity || false; this.acceleration = 0.001; this.time = 0;
    this._boundKeyDown = this.handleKeyDown.bind(this);
    this._boundKeyUp   = this.handleKeyUp.bind(this);
    window.addEventListener('keydown', this._boundKeyDown);
    window.addEventListener('keyup',   this._boundKeyUp);
  }
  handleKeyDown(e) {
    this.pressedKeys[e.key] = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    this.updateVelocity(); this.updateDirection();
  }
  handleKeyUp(e) {
    if (e.key in this.pressedKeys) delete this.pressedKeys[e.key];
    this.updateVelocity(); this.updateDirection();
  }
  updateVelocity() {
    this.velocity.x = 0; this.velocity.y = 0; this.moved = false;
    const k = this.keypress, p = this.pressedKeys;
    const goRight = p[k.right] || p[k.rightAlt] || p[k.rightAlt2];
    const goLeft  = p[k.left]  || p[k.leftAlt]  || p[k.leftAlt2];
    const goUp    = p[k.up]    || p[k.upAlt]    || p[k.upAlt2];
    const goDown  = p[k.down]  || p[k.downAlt]  || p[k.downAlt2];
    if (goRight || goLeft) { this.moved = true; this.velocity.x = goRight ? this.xVelocity : -this.xVelocity; }
    if (goUp    || goDown) { this.moved = true; this.velocity.y = goDown  ? this.yVelocity : -this.yVelocity; }
    if (this.velocity.x !== 0 && this.velocity.y !== 0) { this.velocity.x *= 0.707; this.velocity.y *= 0.707; }
    if (!this.moved && this.gravity) { this.time++; this.velocity.y += 0.5 + this.acceleration * this.time; }
    else if (this.moved) this.time = 0;
  }
  updateDirection() {
    const k = this.keypress, p = this.pressedKeys;
    const goRight = p[k.right] || p[k.rightAlt] || p[k.rightAlt2];
    const goLeft  = p[k.left]  || p[k.leftAlt]  || p[k.leftAlt2];
    const goUp    = p[k.up]    || p[k.upAlt]    || p[k.upAlt2];
    const goDown  = p[k.down]  || p[k.downAlt]  || p[k.downAlt2];
    if      (goLeft && goUp)    this.direction = 'upLeft';
    else if (goLeft && goDown)  this.direction = 'downLeft';
    else if (goRight && goUp)   this.direction = 'upRight';
    else if (goRight && goDown) this.direction = 'downRight';
    else if (goUp)    this.direction = 'up';
    else if (goDown)  this.direction = 'down';
    else if (goRight) this.direction = 'right';
    else if (goLeft)  this.direction = 'left';
  }
  move() {
    if (dead || levelWon) return;
    const r = this.r - 1, dx = this.velocity.x, dy = this.velocity.y;
    const nx = this.x + dx;
    if (!isWall(nx-r,this.y) && !isWall(nx+r,this.y) &&
        !isWall(nx-r,this.y-r) && !isWall(nx+r,this.y-r) &&
        !isWall(nx-r,this.y+r) && !isWall(nx+r,this.y+r)) this.x = nx;
    else this.velocity.x = 0;
    const ny = this.y + dy;
    if (!isWall(this.x,ny-r) && !isWall(this.x,ny+r) &&
        !isWall(this.x-r,ny-r) && !isWall(this.x+r,ny-r) &&
        !isWall(this.x-r,ny) && !isWall(this.x+r,ny)) this.y = ny;
    else this.velocity.y = 0;
  }
  draw() {
    if (dead) return;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
    ctx.fillStyle = '#00fff9'; ctx.fill();
  }
  destroy() {
    window.removeEventListener('keydown', this._boundKeyDown);
    window.removeEventListener('keyup',   this._boundKeyUp);
  }
}

// ─── LEVEL INIT ──────────────────────────────────────────────
function initLevel(idx) {
  const L = LEVELS[idx];
  wallSet = buildWallSet(L.walls); wallBarriers = buildBarriers(L.walls);
  if (player && player.destroy) player.destroy();
  player = new PlayerController({
    x: L.start.x * CELL + CELL/2, y: L.start.y * CELL + CELL/2,
    r: 10, speed: 3.2,
    keypress: {
      up:'ArrowUp', left:'ArrowLeft', down:'ArrowDown', right:'ArrowRight',
      upAlt:'w', leftAlt:'a', downAlt:'s', rightAlt:'d',
      upAlt2:'W', leftAlt2:'A', downAlt2:'S', rightAlt2:'D',
    }
  });
  goalRect = { x:L.goal.x*CELL, y:L.goal.y*CELL, w:L.goal.w*CELL, h:L.goal.h*CELL };
  coins = L.coins.map(c => new Coin({
    x: c.x*CELL+CELL/2, y: c.y*CELL+CELL/2, r:6, value:1,
    color:'#FFD700', stroke:'#B8860B', pulse: Math.random()*Math.PI*2
  }));
  enemies = L.enemies.map(e => ({...e, r:10}));
  dead = false; levelWon = false; deathTimer = 0; winFlash = 0; particles = [];
  if (idx === 0 && !timerActive) { runStartTime = Date.now(); timerActive = true; }
  document.getElementById('h-level').textContent = idx + 1;
  document.getElementById('h-total').textContent = coins.length;
  updateHUD();
}

function updateHUD() {
  document.getElementById('h-deaths').textContent = deaths;
  document.getElementById('h-coins').textContent  = coins.filter(c => c.collected).length;
}

// ─── TIMER ───────────────────────────────────────────────────
function formatTime(ms) {
  const s = Math.floor(ms/1000), m = Math.floor(s/60);
  return `${String(m).padStart(2,'0')}:${String(s%60).padStart(2,'0')}.${String(Math.floor((ms%1000)/10)).padStart(2,'0')}`;
}

function drawTimer() {
  if (!timerActive) return;
  const str = formatTime(Date.now() - runStartTime);
  const pad=8, fw=9, tw=str.length*fw, bx=W-tw-pad*2-10, by=8, bw=tw+pad*2, bh=22;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.font = '13px Orbitron, monospace'; ctx.fillStyle = 'rgba(220,220,220,0.75)';
  ctx.textAlign = 'right'; ctx.fillText(str, W-10-pad+pad, by+bh-6); ctx.textAlign = 'left';
}

// ─── END SCREEN ──────────────────────────────────────────────
function showEndScreen() {
  timerActive = false;
  const totalMs = Date.now() - runStartTime;
  document.getElementById('end-time').textContent   = formatTime(totalMs);
  document.getElementById('end-deaths').textContent = String(deaths);
  document.getElementById('canvas-wrap').style.display = 'none';
  document.getElementById('end-screen').classList.remove('hidden');
  document.getElementById('end-play-again').onclick = () => {
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('canvas-wrap').style.display = '';
    level = 0; deaths = 0; totalCoins = 0; timerActive = false;
    initLevel(0); running = true; loop();
  };
}

// ─── PARTICLES ───────────────────────────────────────────────
function spawnParticles(x, y, color, count=18) {
  for (let i=0; i<count; i++) {
    const angle = (Math.PI*2/count)*i + Math.random()*0.4;
    const speed = 2 + Math.random()*4;
    particles.push({x, y, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed, life:1, color, r:2+Math.random()*3});
  }
}

// ─── ENEMIES ─────────────────────────────────────────────────
function moveEnemies() {
  if (levelWon) return;
  const L = LEVELS[level];
  enemies.forEach((e,i) => {
    const orig = L.enemies[i], r = e.r;
    if (orig.bounce) {
      e.x += e.vx; e.y += e.vy;
      if (isWall(e.x-r,e.y)||isWall(e.x+r,e.y)) { e.vx*=-1; e.x+=e.vx*2; }
      if (isWall(e.x,e.y-r)||isWall(e.x,e.y+r)) { e.vy*=-1; e.y+=e.vy*2; }
    } else if (orig.vx !== 0) {
      e.x += e.vx;
      if (isWall(e.x-r,e.y)||isWall(e.x+r,e.y)||isWall(e.x-r,e.y-r)||isWall(e.x+r,e.y-r)) { e.vx*=-1; e.x+=e.vx*2; }
    } else {
      e.y += e.vy;
      if (isWall(e.x,e.y-r)||isWall(e.x,e.y+r)||isWall(e.x-r,e.y-r)||isWall(e.x+r,e.y-r)) { e.vy*=-1; e.y+=e.vy*2; }
    }
  });
}

// ─── COLLISION ───────────────────────────────────────────────
function checkCollisions() {
  if (dead || levelWon) return;
  for (const e of enemies) {
    const dx=player.x-e.x, dy=player.y-e.y;
    if (Math.sqrt(dx*dx+dy*dy) < player.r+e.r-2) { die(); return; }
  }
  for (const c of coins) { if (c.checkPlayerCollision(player.x,player.y,player.r)) c.collect(); }
  if (coins.every(c=>c.collected) &&
      player.x>goalRect.x && player.x<goalRect.x+goalRect.w &&
      player.y>goalRect.y && player.y<goalRect.y+goalRect.h) winLevel();
}

function die() {
  if (dead) return;
  dead=true; deaths++; deathTimer=60;
  spawnParticles(player.x, player.y, '#ff006e', 24); updateHUD();
}

function winLevel() {
  levelWon=true; winFlash=60;
  spawnParticles(player.x, player.y, '#39ff14', 30);
}

// ─── DRAW ────────────────────────────────────────────────────
function draw(tick) {
  ctx.fillStyle='#111'; ctx.fillRect(0,0,W,H);

  const allCollected = coins.every(c=>c.collected);
  ctx.fillStyle = allCollected ? 'rgba(57,255,20,0.25)' : 'rgba(57,255,20,0.07)';
  ctx.fillRect(goalRect.x, goalRect.y, goalRect.w, goalRect.h);
  ctx.strokeStyle = allCollected ? '#39ff14' : 'rgba(57,255,20,0.3)';
  ctx.lineWidth=1;
  ctx.strokeRect(goalRect.x+0.5, goalRect.y+0.5, goalRect.w-1, goalRect.h-1);
  if (allCollected) {
    ctx.fillStyle='#39ff14'; ctx.font='bold 11px Share Tech Mono'; ctx.textAlign='center';
    ctx.fillText('ENTER', goalRect.x+goalRect.w/2, goalRect.y+goalRect.h/2+4);
    ctx.textAlign='left';
  }

  wallBarriers.forEach(b => {
    if (!b.visible) return;
    ctx.fillStyle=b.color; ctx.fillRect(b.x,b.y,b.width,b.height);
    ctx.strokeStyle=b.stroke; ctx.lineWidth=0.5;
    ctx.strokeRect(b.x+0.5, b.y+0.5, b.width-1, b.height-1);
  });

  coins.forEach(c => c.draw());
  player.draw();

  enemies.forEach(e => {
    ctx.beginPath(); ctx.arc(e.x,e.y,e.r,0,Math.PI*2);
    ctx.fillStyle='#ff006e'; ctx.fill();
  });

  particles = particles.filter(p=>p.life>0);
  particles.forEach(p => {
    p.x+=p.vx; p.y+=p.vy; p.vx*=0.92; p.vy*=0.92; p.life-=0.025;
    ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(0.1,p.r*p.life),0,Math.PI*2);
    ctx.globalAlpha=Math.max(0,p.life); ctx.fillStyle=p.color; ctx.fill();
    ctx.globalAlpha=1;
  });

  if (levelWon && winFlash>0) {
    ctx.fillStyle=`rgba(57,255,20,${winFlash/60*0.3})`; ctx.fillRect(0,0,W,H);
    winFlash--;
    if (winFlash===0) {
      if (level < LEVELS.length-1) { level++; initLevel(level); }
      else if (_onEndingCutscene)   _onEndingCutscene();
    }
  }

  if (dead && deathTimer>0) { deathTimer--; if (deathTimer===0) initLevel(level); }

  drawTimer();
}

// ─── LOOP ────────────────────────────────────────────────────
function loop() {
  if (!running) return;
  t++; player.updateVelocity(); player.move();
  moveEnemies(); checkCollisions(); draw(t);
  requestAnimationFrame(loop);
}

// ─── CUTSCENE ────────────────────────────────────────────────
function showCutscene(scenes, onComplete) {
  csQueue=scenes; csIndex=0; csOnComplete=onComplete;
  document.getElementById('cutscene').classList.remove('hidden','fade-out');
  renderCutsceneSlide();
}

function renderCutsceneSlide() {
  const scene = csQueue[csIndex];
  document.getElementById('cs-label').textContent   = scene.label;
  document.getElementById('cs-counter').textContent = `${csIndex+1} / ${csQueue.length}`;
  document.getElementById('cs-text').innerHTML      = scene.text;
  const btnEl = document.getElementById('cs-btn');
  btnEl.classList.add('visible');
  btnEl.textContent = (csIndex===csQueue.length-1) ? '[ INITIALIZE ]' : '[ CONTINUE ]';
}

function bindCutsceneBtn() {
  document.getElementById('cs-btn').addEventListener('click', () => {
    csIndex++;
    if (csIndex < csQueue.length) {
      const el = document.getElementById('cs-content');
      el.classList.add('glitch-anim');
      setTimeout(() => { el.classList.remove('glitch-anim'); renderCutsceneSlide(); }, 400);
    } else {
      const el = document.getElementById('cutscene');
      el.classList.add('fade-out');
      setTimeout(() => { el.classList.add('hidden'); el.classList.remove('fade-out'); if (csOnComplete) csOnComplete(); }, 600);
    }
  });
}

// ─── OVERLAY ─────────────────────────────────────────────────
function showOverlay(title, sub, colorClass, btnText, cb) {
  const ov=document.getElementById('overlay'), ot=document.getElementById('overlay-title');
  const os=document.getElementById('overlay-sub'), btn=document.getElementById('start-btn');
  ot.textContent=title; ot.className=colorClass;
  os.innerHTML=sub.replace(/\n/g,'<br>'); btn.textContent=btnText;
  btn.onclick=()=>{ ov.classList.add('hidden'); cb(); };
  ov.classList.remove('hidden'); running=false;
}

// ─── PUBLIC API ──────────────────────────────────────────────

export function initGame({ canvasId, introScenes, onEndingCutscene }) {
  canvas = document.getElementById(canvasId);
  ctx    = canvas.getContext('2d');
  canvas.width = W; canvas.height = H;
  _introScenes      = introScenes;
  _onEndingCutscene = onEndingCutscene;
  bindCutsceneBtn();
  // Global dev keys
  window.addEventListener('keydown', e => {
    if ((e.key==='z'||e.key==='Z') && running && !dead) {
      if (level<LEVELS.length-1) { level++; initLevel(level); }
      else if (_onEndingCutscene) _onEndingCutscene();
    }
    if ((e.key==='r'||e.key==='R') && running) {
      level=0; deaths=0; totalCoins=0; timerActive=false; initLevel(0);
    }
  });
}

export function startGame() {
  document.getElementById('overlay').classList.add('hidden');
  showCutscene(_introScenes, () => {
    level=0; deaths=0; totalCoins=0; timerActive=false;
    initLevel(0); running=true; loop();
  });
}

export { showCutscene, showEndScreen };
