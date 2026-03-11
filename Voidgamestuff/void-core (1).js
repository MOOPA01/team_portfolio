// =============================================================
//  V.O.I.D.EXE  —  void-core.js
//  Place at: assets/js/void-core.js
//
//  Contains:
//    · Grid constants & canvas setup
//    · Wall builder helpers
//    · Game state variables
//    · Speedrun mode state & timer
//    · Music engine (Web Audio API — 5 unique synthesized tracks)
//    · initLevel / updateHUD
//    · Particle system
//    · Player movement
//    · Enemy movement
//    · Collision detection
//    · All drawing
//    · Game loop
//    · Cutscene engine
//    · Overlay system
//    · Speedrun results screen
//    · Keyboard input
//
//  Load order: void-core.js → void-level-1..5.js
// =============================================================


// ─── GRID CONSTANTS ──────────────────────────────────────────
const CELL = 32;
const COLS = 22;
const ROWS = 16;
const W    = COLS * CELL;
const H    = ROWS * CELL;

// ─── CANVAS ──────────────────────────────────────────────────
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
canvas.width  = W;
canvas.height = H;

// ─── LEVEL REGISTRY ──────────────────────────────────────────
const LEVELS = [];

// ─── GAME STATE ──────────────────────────────────────────────
let level      = 0;
let deaths     = 0;
let totalCoins = 0;
let player, enemies, coins, wallSet, goalRect;
let keys       = {};
let dead       = false;
let levelWon   = false;
let deathTimer = 0;
let winFlash   = 0;
let running    = false;
let particles  = [];
let t          = 0;

// ─── SPEEDRUN STATE ──────────────────────────────────────────
let speedrunMode    = false;
let speedrunActive  = false;
let runStartTime    = 0;     // absolute start of the entire run (never resets on death)
let levelSplitStart = 0;     // wall-clock time when current level's split began
let levelTimes      = [];    // completed split times in ms per level
let speedrunDeaths  = 0;     // total deaths across entire run


// ─── WALL UTILITIES ──────────────────────────────────────────

function buildBorderWalls(cols, rows) {
  const w = [];
  for (let x = 0; x < cols; x++) {
    w.push({x, y: 0});
    w.push({x, y: rows - 1});
  }
  for (let y = 1; y < rows - 1; y++) {
    w.push({x: 0,        y});
    w.push({x: cols - 1, y});
  }
  return w;
}

function rectWall(x, y, w, h) {
  const cells = [];
  for (let row = y; row < y + h; row++)
    for (let col = x; col < x + w; col++)
      cells.push({x: col, y: row});
  return cells;
}

function buildWallSet(walls) {
  return new Set(walls.map(w => `${w.x},${w.y}`));
}

function isWall(px, py) {
  return wallSet.has(`${Math.floor(px / CELL)},${Math.floor(py / CELL)}`);
}


// ─── LEVEL INIT ──────────────────────────────────────────────

function initLevel(idx) {
  const L = LEVELS[idx];
  wallSet  = buildWallSet(L.walls);

  player = {
    x:     L.start.x * CELL + CELL / 2,
    y:     L.start.y * CELL + CELL / 2,
    r:     10,
    trail: []
  };

  goalRect = {
    x: L.goal.x * CELL, y: L.goal.y * CELL,
    w: L.goal.w * CELL, h: L.goal.h * CELL
  };

  coins = L.coins.map(c => ({
    x: c.x * CELL + CELL / 2, y: c.y * CELL + CELL / 2,
    r: 6, collected: false, pulse: Math.random() * Math.PI * 2
  }));

  enemies   = L.enemies.map(e => ({...e, r: 10}));
  dead      = false; levelWon = false; deathTimer = 0; winFlash = 0;
  particles = [];

  document.getElementById('h-level').textContent = idx + 1;
  document.getElementById('h-total').textContent = coins.length;
  updateHUD();

  // Speedrun: timer keeps running through deaths. Only record a new split
  // start when entering a level for the first time this run (not on retries).
  if (speedrunMode) {
    speedrunActive = true;
    if (levelTimes.length === idx) {
      levelSplitStart = Date.now();
      if (idx === 0) runStartTime = levelSplitStart;
    }
  }
}

function updateHUD() {
  document.getElementById('h-deaths').textContent = deaths;
  document.getElementById('h-coins').textContent  = coins.filter(c => c.collected).length;
}


// ─── SPEEDRUN HELPERS ────────────────────────────────────────

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const minutes  = Math.floor(totalSec / 60);
  const seconds  = totalSec % 60;
  const centis   = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(centis).padStart(2,'0')}`;
}

function calcTier(totalMs, totalDeaths) {
  const s = totalMs / 1000;
  if (s < 90  && totalDeaths === 0) return 'S+';
  if (s < 120 && totalDeaths <= 2)  return 'S';
  if (s < 180 && totalDeaths <= 5)  return 'A';
  if (s < 240 && totalDeaths <= 10) return 'B';
  if (s < 360 && totalDeaths <= 20) return 'C';
  if (s < 600 || totalDeaths <= 40) return 'D';
  return 'F';
}

// ─── PERSONAL BEST STORAGE ──────────────────────────────────
// Schema: { bestTime, leastDeaths }

function loadPB() {
  try {
    const raw = localStorage.getItem('void_pb');
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return { bestTime: null, leastDeaths: null };
}

function savePB(pb) {
  try { localStorage.setItem('void_pb', JSON.stringify(pb)); } catch(e) {}
}

function updatePB(totalMs, _tier, deaths, _lvlTimes) {
  const pb = loadPB();
  if (pb.bestTime    === null || totalMs < pb.bestTime)    pb.bestTime    = totalMs;
  if (pb.leastDeaths === null || deaths  < pb.leastDeaths) pb.leastDeaths = deaths;
  savePB(pb);
  return pb;
}

// ─── SPEEDRUN RESULTS ────────────────────────────────────────

function showSpeedrunResults() {
  const totalMs = levelTimes.reduce((a, b) => a + b, 0);
  const pb      = updatePB(totalMs, calcTier(totalMs, speedrunDeaths), speedrunDeaths, levelTimes);

  // Populate the 4 stats
  document.getElementById('sr-run-time').textContent   = formatTime(totalMs);
  document.getElementById('sr-best-time').textContent  = pb.bestTime   !== null ? formatTime(pb.bestTime)  : '—';
  document.getElementById('sr-run-deaths').textContent = String(speedrunDeaths);
  document.getElementById('sr-best-deaths').textContent= pb.leastDeaths !== null ? String(pb.leastDeaths) : '—';

  document.getElementById('canvas-wrap').style.display = 'none';
  document.getElementById('speedrun-results').classList.remove('hidden');

  document.getElementById('sr-play-again').onclick = () => {
    document.getElementById('speedrun-results').classList.add('hidden');
    document.getElementById('canvas-wrap').style.display = '';
    level = 0; deaths = 0; totalCoins = 0;
    speedrunMode = false; speedrunDeaths = 0; levelTimes = [];
    initLevel(0); running = true; loop();
  };

  document.getElementById('sr-play-speedrun').onclick = () => {
    document.getElementById('speedrun-results').classList.add('hidden');
    document.getElementById('canvas-wrap').style.display = '';
    level = 0; deaths = 0; totalCoins = 0;
    speedrunMode = true; speedrunDeaths = 0; levelTimes = [];
    initLevel(0); running = true; loop();
  };
}


// ─── PARTICLES ───────────────────────────────────────────────

function spawnParticles(x, y, color, count = 18) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.4;
    const speed = 2 + Math.random() * 4;
    particles.push({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 1, color, r: 2 + Math.random() * 3
    });
  }
}


// ─── PLAYER MOVEMENT ─────────────────────────────────────────

function movePlayer() {
  if (dead || levelWon) return;
  const speed = 3.2;
  let dx = 0, dy = 0;
  if (keys['ArrowLeft']  || keys['a'] || keys['A']) dx -= speed;
  if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += speed;
  if (keys['ArrowUp']    || keys['w'] || keys['W']) dy -= speed;
  if (keys['ArrowDown']  || keys['s'] || keys['S']) dy += speed;
  if (dx && dy) { dx *= 0.707; dy *= 0.707; }

  const r  = player.r - 1;
  const nx = player.x + dx;
  if (!isWall(nx-r, player.y) && !isWall(nx+r, player.y) &&
      !isWall(nx-r, player.y-r) && !isWall(nx+r, player.y-r) &&
      !isWall(nx-r, player.y+r) && !isWall(nx+r, player.y+r))
    player.x = nx;

  const ny = player.y + dy;
  if (!isWall(player.x, ny-r) && !isWall(player.x, ny+r) &&
      !isWall(player.x-r, ny-r) && !isWall(player.x+r, ny-r) &&
      !isWall(player.x-r, ny) && !isWall(player.x+r, ny))
    player.y = ny;

  // trail removed
}


// ─── ENEMY MOVEMENT ──────────────────────────────────────────

function moveEnemies() {
  if (levelWon) return;
  const L = LEVELS[level];
  enemies.forEach((e, i) => {
    const orig = L.enemies[i];
    const r    = e.r;
    if (orig.bounce) {
      e.x += e.vx; e.y += e.vy;
      if (isWall(e.x-r, e.y) || isWall(e.x+r, e.y)) { e.vx *= -1; e.x += e.vx * 2; }
      if (isWall(e.x, e.y-r) || isWall(e.x, e.y+r)) { e.vy *= -1; e.y += e.vy * 2; }
    } else if (orig.vx !== 0) {
      e.x += e.vx;
      if (isWall(e.x-r, e.y) || isWall(e.x+r, e.y) ||
          isWall(e.x-r, e.y-r) || isWall(e.x+r, e.y-r)) {
        e.vx *= -1; e.x += e.vx * 2;
      }
    } else {
      e.y += e.vy;
      if (isWall(e.x, e.y-r) || isWall(e.x, e.y+r) ||
          isWall(e.x-r, e.y-r) || isWall(e.x+r, e.y-r)) {
        e.vy *= -1; e.y += e.vy * 2;
      }
    }
  });
}


// ─── COLLISION ───────────────────────────────────────────────

function checkCollisions() {
  if (dead || levelWon) return;
  for (const e of enemies) {
    const dx = player.x - e.x, dy = player.y - e.y;
    if (Math.sqrt(dx*dx + dy*dy) < player.r + e.r - 2) { die(); return; }
  }
  for (const c of coins) {
    if (c.collected) continue;
    const dx = player.x - c.x, dy = player.y - c.y;
    if (Math.sqrt(dx*dx + dy*dy) < player.r + c.r + 2) {
      c.collected = true; totalCoins++;
      spawnParticles(c.x, c.y, '#ffee00', 12);
      updateHUD();
    }
  }
  if (coins.every(c => c.collected) &&
      player.x > goalRect.x && player.x < goalRect.x + goalRect.w &&
      player.y > goalRect.y && player.y < goalRect.y + goalRect.h) {
    winLevel();
  }
}

function die() {
  if (dead) return;
  dead = true; deaths++; deathTimer = 60;
  if (speedrunMode) speedrunDeaths++;
  spawnParticles(player.x, player.y, '#ff006e', 24);
  updateHUD();
}

function winLevel() {
  levelWon = true; winFlash = 60;
  // Snap split for this level
  if (speedrunMode && speedrunActive) {
    levelTimes.push(Date.now() - levelSplitStart);
    // levelSplitStart will be updated in initLevel when next level loads
  }
  spawnParticles(player.x, player.y, '#39ff14', 30);
}


// ─── SPEEDRUN HUD OVERLAY ────────────────────────────────────

function drawSpeedrunHUD() {
  if (!speedrunMode || !speedrunActive) return;
  // Show total run time (continuous, never resets)
  const totalElapsed = Date.now() - runStartTime;
  // Show current level split time
  const splitElapsed = Date.now() - levelSplitStart;

  ctx.save();
  ctx.textAlign = 'right';

  // Total run clock — top right
  ctx.font      = '13px Orbitron, monospace';
  ctx.fillStyle = 'rgba(255,238,0,0.95)';
  ctx.fillText('⏱ ' + formatTime(totalElapsed), W - 10, 20);

  // Current level split — dimmer, below total
  ctx.font      = '10px Share Tech Mono, monospace';
  ctx.fillStyle = 'rgba(255,238,0,0.5)';
  ctx.fillText('L' + (level + 1) + ' ' + formatTime(splitElapsed), W - 10, 36);

  // Completed splits
  if (levelTimes.length > 0) {
    levelTimes.forEach((ms, i) => {
      ctx.fillText(`L${i+1} ${formatTime(ms)}`, W - 10, 50 + i * 13);
    });
  }
  ctx.textAlign = 'left';
  ctx.restore();
}


// ─── DRAWING ─────────────────────────────────────────────────

function draw(t) {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, W, H);

  // Goal zone — solid fill, outline, ENTER label when ready
  const allCollected = coins.every(c => c.collected);
  ctx.fillStyle = allCollected ? 'rgba(57,255,20,0.25)' : 'rgba(57,255,20,0.07)';
  ctx.fillRect(goalRect.x, goalRect.y, goalRect.w, goalRect.h);
  ctx.strokeStyle = allCollected ? '#39ff14' : 'rgba(57,255,20,0.3)';
  ctx.lineWidth   = 1;
  ctx.strokeRect(goalRect.x + 0.5, goalRect.y + 0.5, goalRect.w - 1, goalRect.h - 1);
  if (allCollected) {
    ctx.fillStyle = '#39ff14';
    ctx.font = 'bold 11px Share Tech Mono'; ctx.textAlign = 'center';
    ctx.fillText('ENTER', goalRect.x + goalRect.w/2, goalRect.y + goalRect.h/2 + 4);
    ctx.textAlign = 'left';
  }

  // Walls — flat dark fill, single border
  LEVELS[level].walls.forEach(w => {
    const wx = w.x * CELL, wy = w.y * CELL;
    ctx.fillStyle = '#222';
    ctx.fillRect(wx, wy, CELL, CELL);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(wx + 0.5, wy + 0.5, CELL - 1, CELL - 1);
  });

  // Coins — flat yellow circles, no pulse, no glow
  coins.forEach(c => {
    if (c.collected) return;
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI*2);
    ctx.fillStyle = '#ffee00'; ctx.fill();
  });

  // Player — flat cyan circle, no trail, no glow
  if (!dead) {
    ctx.beginPath(); ctx.arc(player.x, player.y, player.r, 0, Math.PI*2);
    ctx.fillStyle = '#00fff9'; ctx.fill();
  }

  // Enemies — flat red circles, no pulse, no glow
  enemies.forEach(e => {
    ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI*2);
    ctx.fillStyle = '#ff006e'; ctx.fill();
  });

  // Particles — kept for death/win feedback, no shadows
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vx *= 0.92; p.vy *= 0.92; p.life -= 0.025;
    ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.1, p.r * p.life), 0, Math.PI*2);
    ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; ctx.fill();
    ctx.globalAlpha = 1;
  });

  // Win flash
  if (levelWon && winFlash > 0) {
    ctx.fillStyle = `rgba(57,255,20,${winFlash/60*0.3})`;
    ctx.fillRect(0,0,W,H);
    winFlash--;
    if (winFlash === 0) {
      if (level < LEVELS.length - 1) {
        level++;
        initLevel(level);
      } else {
        showEndingCutscene();
      }
    }
  }

  // Respawn timer (no tint — just wait 1 second then reset)
  if (dead && deathTimer > 0) {
    deathTimer--;
    if (deathTimer === 0) initLevel(level);
  }

  // Speedrun timer HUD
  drawSpeedrunHUD();
}


// ─── GAME LOOP ───────────────────────────────────────────────

function loop() {
  if (!running) return;
  t++;
  movePlayer();
  moveEnemies();
  checkCollisions();
  draw(t);
  requestAnimationFrame(loop);
}


// ─── CUTSCENE ENGINE ─────────────────────────────────────────

let csQueue = [], csIndex = 0, csOnComplete = null;

function showCutscene(scenes, onComplete) {
  csQueue = scenes; csIndex = 0; csOnComplete = onComplete;
  document.getElementById('cutscene').classList.remove('hidden', 'fade-out');
  renderCutsceneSlide();
}

function renderCutsceneSlide() {
  const scene = csQueue[csIndex];
  document.getElementById('cs-label').textContent   = scene.label;
  document.getElementById('cs-counter').textContent = `${csIndex + 1} / ${csQueue.length}`;

  // Show full text immediately — no typewriter
  const textEl = document.getElementById('cs-text');
  textEl.innerHTML = scene.text;

  const btnEl = document.getElementById('cs-btn');
  btnEl.classList.add('visible');
  btnEl.textContent = (csIndex === csQueue.length - 1) ? '[ INITIALIZE ]' : '[ CONTINUE ]';
}

document.getElementById('cs-btn').addEventListener('click', () => {
  csIndex++;
  if (csIndex < csQueue.length) {
    const content = document.getElementById('cs-content');
    content.classList.add('glitch-anim');
    setTimeout(() => { content.classList.remove('glitch-anim'); renderCutsceneSlide(); }, 400);
  } else {
    const el = document.getElementById('cutscene');
    el.classList.add('fade-out');
    setTimeout(() => {
      el.classList.add('hidden'); el.classList.remove('fade-out');
      if (csOnComplete) csOnComplete();
    }, 600);
  }
});


// ─── OVERLAY ─────────────────────────────────────────────────

function showOverlay(title, sub, colorClass, btnText, cb) {
  const ov  = document.getElementById('overlay');
  const ot  = document.getElementById('overlay-title');
  const os  = document.getElementById('overlay-sub');
  const btn = document.getElementById('start-btn');
  ot.textContent  = title;
  ot.className    = colorClass;
  os.innerHTML    = sub.replace(/\n/g,'<br>');
  btn.textContent = btnText;
  btn.onclick = () => { ov.classList.add('hidden'); cb(); };
  ov.classList.remove('hidden');
  running = false;
}


// ─── INPUT ───────────────────────────────────────────────────

window.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();

  // Secret dev skip — not advertised
  if ((e.key === 'z' || e.key === 'Z') && running && !dead) {
    if (speedrunMode && speedrunActive) {
      levelTimes.push(Date.now() - levelSplitStart);
    }
    if (level < LEVELS.length - 1) {
      level++; initLevel(level);
    } else {
      showEndingCutscene();
    }
  }

  // R — restart game from level 1 (skips cutscene, keeps mode)
  if ((e.key === 'r' || e.key === 'R') && running) {
    level = 0; deaths = 0; totalCoins = 0;
    speedrunDeaths = 0; levelTimes = [];
    initLevel(0);
    // loop() is already running via rAF, initLevel resets state cleanly
  }
});
window.addEventListener('keyup', e => { keys[e.key] = false; });
