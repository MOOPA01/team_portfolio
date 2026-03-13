// =============================================================
//  H.E.I.S.T.EXE  —  heist-core.js  (ES Module)
//  Ghost Protocol: Infiltration Engine
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
let level = 0, deaths = 0, totalGems = 0;
let player, guards, gems, wallSet, wallBarriers, goalRect;
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
    color: 'rgba(20,24,36,1)', stroke: 'rgba(80,100,160,0.5)',
    visible: true, hitbox: { widthPercentage: 1.0, heightPercentage: 1.0 }
  }));
}

// ─── GEM CLASS (logic adapted from Coin.js) ──────────────────
class Gem {
  constructor(data) {
    this.x     = data.x; this.y = data.y; this.r = data.r || 6;
    this.value = Number(data.value ?? 1);
    // From Coin.js: collection state machine fields
    this.collected            = false;
    this.collectCount         = 0;
    this.collectCooldownUntil = 0;
    this.color = data.color || '#00c8ff'; // no stroke — one solid color
  }
  draw() {
    // Mirrors Coin.js draw(): bail if collected, then draw shape
    if (this.collected) return;
    const r = this.r;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.4);
    ctx.lineTo(r, 0);
    ctx.lineTo(0,  r * 1.4);
    ctx.lineTo(-r, 0);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill(); // no stroke
    ctx.restore();
  }
  // From Coin.js collect(): cooldown guard, set collected, bump count, spawn effect
  collect() {
    if (performance.now() < this.collectCooldownUntil) return false;
    this.collected            = true;
    this.collectCooldownUntil = performance.now() + 200;
    this.collectCount        += 1;
    totalGems++;
    spawnParticles(this.x, this.y, this.color, 14);
    updateHUD(); return true;
  }
  // From Coin.js checkPlayerCollision(): cooldown + radius distance check
  checkPlayerCollision(px, py, pr) {
    if (this.collected || performance.now() < this.collectCooldownUntil) return false;
    const dx = px - this.x, dy = py - this.y;
    return Math.sqrt(dx*dx + dy*dy) < pr + this.r + 2;
  }
}

// ─── PLAYER CONTROLLER ───────────────────────────────────────
class PlayerController {
  constructor(data) {
    this.keypress = {
      up:'ArrowUp', left:'ArrowLeft', down:'ArrowDown', right:'ArrowRight',
      upAlt:'w', leftAlt:'a', downAlt:'s', rightAlt:'d',
      upAlt2:'W', leftAlt2:'A', downAlt2:'S', rightAlt2:'D',
    };
    this.x = data.x; this.y = data.y; this.r = data.r || 9;
    this.speed = data.speed || 3.2;
    this.xVelocity = this.speed; this.yVelocity = this.speed;
    this.velocity = {x:0, y:0}; this.pressedKeys = {};
    this.moved = false;
    this._boundKeyDown = this.handleKeyDown.bind(this);
    this._boundKeyUp   = this.handleKeyUp.bind(this);
    window.addEventListener('keydown', this._boundKeyDown);
    window.addEventListener('keyup',   this._boundKeyUp);
  }
  handleKeyDown(e) {
    this.pressedKeys[e.key] = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    this.updateVelocity();
  }
  handleKeyUp(e) {
    if (e.key in this.pressedKeys) delete this.pressedKeys[e.key];
    this.updateVelocity();
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
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = '#00e87a';
    ctx.fill();
    ctx.fillStyle = '#001a0a';
    ctx.beginPath();
    ctx.arc(this.x - 3, this.y - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + 3, this.y - 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  destroy() {
    window.removeEventListener('keydown', this._boundKeyDown);
    window.removeEventListener('keyup',   this._boundKeyUp);
  }
}

// ─── LEVEL INIT ──────────────────────────────────────────────
function initLevel(idx) {
  const L = LEVELS[idx];
  wallSet = buildWallSet(L.walls);
  wallBarriers = buildBarriers(L.walls);
  if (player && player.destroy) player.destroy();
  player = new PlayerController({
    x: L.start.x * CELL + CELL/2,
    y: L.start.y * CELL + CELL/2,
    r: 9,
    speed: 3.2,
  });
  goalRect = { x:L.goal.x*CELL, y:L.goal.y*CELL, w:L.goal.w*CELL, h:L.goal.h*CELL };
  gems = L.gems.map(g => new Gem({
    x: g.x * CELL + CELL/2,
    y: g.y * CELL + CELL/2,
    r: g.r || 6,
    value: g.value || 1,
    color: g.color || '#00c8ff',
  }));
  guards = L.guards.map(g => ({...g, r: g.r || 10}));
  dead = false; levelWon = false; deathTimer = 0; winFlash = 0; particles = [];
  if (idx === 0 && !timerActive) { runStartTime = Date.now(); timerActive = true; }
  document.getElementById('h-level').textContent = idx + 1;
  document.getElementById('h-total').textContent = gems.length;
  updateHUD();
}

function updateHUD() {
  document.getElementById('h-deaths').textContent = deaths;
  document.getElementById('h-gems').textContent   = gems.filter(g => g.collected).length;
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
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(0,200,120,0.15)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.font = '13px Orbitron, monospace'; ctx.fillStyle = 'rgba(0,230,140,0.85)';
  ctx.textAlign = 'right'; ctx.fillText(str, W-10-pad+pad, by+bh-6); ctx.textAlign = 'left';
}

// ─── END SCREEN ──────────────────────────────────────────────
export function showEndScreen() {
  timerActive = false;
  const totalMs = Date.now() - runStartTime;
  document.getElementById('end-time').textContent   = formatTime(totalMs);
  document.getElementById('end-deaths').textContent = String(deaths);
  document.getElementById('canvas-wrap').style.display = 'none';
  document.getElementById('end-screen').classList.remove('hidden');
  document.getElementById('end-play-again').onclick = () => {
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('canvas-wrap').style.display = '';
    level = 0; deaths = 0; totalGems = 0; timerActive = false;
    initLevel(0); running = true; loop();
  };
}

// ─── PARTICLES ───────────────────────────────────────────────
function spawnParticles(x, y, color, count=18) {
  for (let i=0; i<count; i++) {
    const angle = (Math.PI*2/count)*i + Math.random()*0.4;
    const speed = 1.5 + Math.random()*4;
    particles.push({
      x, y,
      vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
      life: 1, color, r: 1.5 + Math.random()*3
    });
  }
}

// ─── GUARDS (enemies) ────────────────────────────────────────
function moveGuards() {
  if (levelWon) return;
  const L = LEVELS[level];
  guards.forEach((g, i) => {
    const orig = L.guards[i], r = g.r;
    if (orig.patrol) {
      // Patrol between two points
      const { ax, ay, bx, by } = orig.patrol;
      const dx = bx - ax, dy = by - ay;
      const len = Math.sqrt(dx*dx + dy*dy);
      g._t = (g._t || 0) + (g._dir || 1) * (orig.speed || 2.5) / len;
      if (g._t >= 1) { g._t = 1; g._dir = -1; }
      if (g._t <= 0) { g._t = 0; g._dir =  1; }
      g.x = ax + dx * g._t;
      g.y = ay + dy * g._t;
    } else if (orig.bounce) {
      g.x += g.vx; g.y += g.vy;
      if (isWall(g.x-r,g.y)||isWall(g.x+r,g.y)) { g.vx*=-1; g.x+=g.vx*2; }
      if (isWall(g.x,g.y-r)||isWall(g.x,g.y+r)) { g.vy*=-1; g.y+=g.vy*2; }
    } else if (orig.vx !== 0) {
      g.x += g.vx;
      if (isWall(g.x-r,g.y)||isWall(g.x+r,g.y)||isWall(g.x-r,g.y-r)||isWall(g.x+r,g.y-r)) {
        g.vx *= -1; g.x += g.vx*2;
      }
    } else {
      g.y += g.vy;
      if (isWall(g.x,g.y-r)||isWall(g.x,g.y+r)||isWall(g.x-r,g.y-r)||isWall(g.x+r,g.y-r)) {
        g.vy *= -1; g.y += g.vy*2;
      }
    }
  });
}

// ─── COLLISION ───────────────────────────────────────────────
function checkCollisions() {
  if (dead || levelWon) return;
  for (const g of guards) {
    const dx = player.x - g.x, dy = player.y - g.y;
    if (Math.sqrt(dx*dx + dy*dy) < player.r + g.r - 2) { die(); return; }
  }
  for (const gem of gems) {
    if (gem.checkPlayerCollision(player.x, player.y, player.r)) gem.collect();
  }
  if (gems.every(g => g.collected) &&
      player.x > goalRect.x && player.x < goalRect.x + goalRect.w &&
      player.y > goalRect.y && player.y < goalRect.y + goalRect.h) {
    winLevel();
  }
}

function die() {
  if (dead) return;
  dead = true; deaths++; deathTimer = 70;
  spawnParticles(player.x, player.y, '#ff3355', 28); updateHUD();
}

function winLevel() {
  levelWon = true; winFlash = 70;
  spawnParticles(player.x, player.y, '#00e87a', 32);
  spawnParticles(goalRect.x + goalRect.w/2, goalRect.y + goalRect.h/2, '#00fff9', 20);
}

// ─── DRAW ────────────────────────────────────────────────────
function drawFloorGrid() {
  ctx.strokeStyle = 'rgba(30,60,100,0.2)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= W; x += CELL) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += CELL) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

function drawGuard(g) {
  ctx.beginPath();
  ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
  ctx.fillStyle = '#cc2244';
  ctx.fill();
  ctx.strokeStyle = '#881133';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function draw() {
  // Background
  ctx.fillStyle = '#0a0e1a';
  ctx.fillRect(0, 0, W, H);
  drawFloorGrid();

  // Goal zone
  const allCollected = gems.every(g => g.collected);
  ctx.fillStyle = allCollected ? 'rgba(0,232,122,0.22)' : 'rgba(0,232,122,0.05)';
  ctx.fillRect(goalRect.x, goalRect.y, goalRect.w, goalRect.h);
  ctx.strokeStyle = allCollected ? '#00e87a' : 'rgba(0,232,122,0.25)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(goalRect.x+0.5, goalRect.y+0.5, goalRect.w-1, goalRect.h-1);
  if (allCollected) {
    ctx.fillStyle = '#00e87a';
    ctx.font = 'bold 10px Share Tech Mono';
    ctx.textAlign = 'center';
    ctx.fillText('EXTRACT', goalRect.x + goalRect.w/2, goalRect.y + goalRect.h/2 + 4);
    ctx.textAlign = 'left';
  }

  // Walls
  wallBarriers.forEach(b => {
    if (!b.visible) return;
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.width, b.height);
    // Wall detail lines
    ctx.strokeStyle = b.stroke;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(b.x+0.5, b.y+0.5, b.width-1, b.height-1);
    // Inner cross-hatch on wall
    ctx.strokeStyle = 'rgba(60,90,150,0.15)';
    ctx.beginPath(); ctx.moveTo(b.x+2, b.y+2); ctx.lineTo(b.x+b.width-2, b.y+b.height-2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b.x+b.width-2, b.y+2); ctx.lineTo(b.x+2, b.y+b.height-2); ctx.stroke();
  });

  // Gems
  gems.forEach(g => g.draw());

  // Guards
  guards.forEach(g => drawGuard(g));

  // Player
  player.draw();

  // Particles
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    p.vx *= 0.91; p.vy *= 0.91; p.life -= 0.022;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.1, p.r * p.life), 0, Math.PI * 2);
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle   = p.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  // Win flash
  if (levelWon && winFlash > 0) {
    ctx.fillStyle = `rgba(0,232,122,${winFlash/70 * 0.28})`;
    ctx.fillRect(0, 0, W, H);
    winFlash--;
    if (winFlash === 0) {
      if (level < LEVELS.length - 1) { level++; initLevel(level); }
      else if (_onEndingCutscene)     _onEndingCutscene();
    }
  }

  // Death flash
  if (dead && deathTimer > 0) {
    ctx.fillStyle = `rgba(255,30,60,${deathTimer/70 * 0.35})`;
    ctx.fillRect(0, 0, W, H);
    deathTimer--;
    if (deathTimer === 0) initLevel(level);
  }

  drawTimer();
}

// ─── LOOP ────────────────────────────────────────────────────
function loop() {
  if (!running) return;
  t++;
  player.updateVelocity(); player.move();
  moveGuards(); checkCollisions(); draw();
  requestAnimationFrame(loop);
}

// ─── CUTSCENE ────────────────────────────────────────────────
export function showCutscene(scenes, onComplete) {
  csQueue = scenes; csIndex = 0; csOnComplete = onComplete;
  document.getElementById('cutscene').classList.remove('hidden', 'fade-out');
  renderCutsceneSlide();
}

function renderCutsceneSlide() {
  const scene = csQueue[csIndex];
  document.getElementById('cs-label').textContent   = scene.label;
  document.getElementById('cs-counter').textContent = `${csIndex+1} / ${csQueue.length}`;
  document.getElementById('cs-text').innerHTML      = scene.text;
  const btnEl = document.getElementById('cs-btn');
  btnEl.textContent = (csIndex === csQueue.length - 1) ? '[ EXECUTE ]' : '[ CONTINUE ]';
}

function bindCutsceneBtn() {
  document.getElementById('cs-btn').addEventListener('click', () => {
    csIndex++;
    if (csIndex < csQueue.length) {
      const el = document.getElementById('cs-content');
      el.style.opacity = '0.3';
      setTimeout(() => { el.style.opacity = '1'; renderCutsceneSlide(); }, 300);
    } else {
      const el = document.getElementById('cutscene');
      el.classList.add('fade-out');
      setTimeout(() => {
        el.classList.add('hidden');
        el.classList.remove('fade-out');
        if (csOnComplete) csOnComplete();
      }, 600);
    }
  });
}

// ─── PUBLIC API ──────────────────────────────────────────────

export function initGame({ canvasId, introScenes, onEndingCutscene }) {
  canvas = document.getElementById(canvasId);
  ctx    = canvas.getContext('2d');
  canvas.width  = W;
  canvas.height = H;
  _introScenes      = introScenes;
  _onEndingCutscene = onEndingCutscene;
  bindCutsceneBtn();
  // Dev skip key (Z) and restart key (R)
  window.addEventListener('keydown', e => {
    if ((e.key === 'z' || e.key === 'Z') && running && !dead) {
      if (level < LEVELS.length - 1) { level++; initLevel(level); }
      else if (_onEndingCutscene) _onEndingCutscene();
    }
    if ((e.key === 'r' || e.key === 'R') && running) {
      level = 0; deaths = 0; totalGems = 0; timerActive = false; initLevel(0);
    }
  });
}

export function startGame() {
  document.getElementById('overlay').classList.add('hidden');
  showCutscene(_introScenes, () => {
    level = 0; deaths = 0; totalGems = 0; timerActive = false;
    initLevel(0); running = true; loop();
  });
}
