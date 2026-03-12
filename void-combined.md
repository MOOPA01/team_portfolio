---
layout: post
permalink: /rigved
---

<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>V.O.I.D.EXE</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
<style>
/* =============================================================
   V.O.I.D.EXE  —  void-game.css
   ============================================================= */


:root {
  --bg:      #111;
  --surface: #1a1a1a;
  --border:  #333;
  --text:    #ccc;
  --dim:     #666;
  --white:   #eee;
  --cyan:    #00fff9;
  --yellow:  #ffee00;
  --green:   #39ff14;
  --pink:    #ff006e;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Share Tech Mono', monospace;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 20px 0 40px;
  user-select: none;
}

/* ── FULLSCREEN BUTTON ── */
#fullscreen-btn {
  position: fixed;
  top: 10px; right: 10px;
  z-index: 500;
  background: #1a1a1a;
  border: 1px solid #333;
  color: #888;
  width: 34px; height: 34px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  opacity: 0.5;
  transition: opacity 0.2s;
  padding: 0;
}
#fullscreen-btn:hover { opacity: 1; }
#fullscreen-btn svg {
  width: 16px; height: 16px;
  fill: none; stroke: #aaa; stroke-width: 2;
  stroke-linecap: round;
}


/* ── WRAPPER ── */
#wrapper {
  position: relative; z-index: 1;
  display: flex; flex-direction: column;
  align-items: center; gap: 14px;
}

/* ── TITLE ── */
#title {
  font-family: 'Orbitron', monospace;
  font-size: 2.2rem; font-weight: 900; letter-spacing: 0.18em;
  color: var(--white);
}

/* ── HUD ── */
#hud { display: flex; gap: 40px; font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dim); }
.hud-item span { color: var(--white); font-size: 1.1rem; font-family: 'Orbitron', monospace; }

/* ── CANVAS ── */
#canvas-wrap { position: relative; border: 1px solid #333; }
canvas { display: block; }

/* ── GAME OVERLAY (start screen) ── */
#overlay {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: rgba(17,17,17,0.95);
  gap: 14px;
}
#overlay.hidden { display: none; }

#overlay-title {
  font-family: 'Orbitron', monospace; font-size: 2.4rem; font-weight: 900;
  text-align: center; line-height: 1.2; color: var(--white);
}
#overlay-title.cyan  { color: var(--cyan); }
#overlay-title.pink  { color: var(--pink); }
#overlay-title.green { color: var(--green); }

#overlay-sub {
  font-size: 0.9rem; color: var(--dim);
  letter-spacing: 0.1em; text-align: center; line-height: 1.8;
}

/* ── BUTTONS ── */
.void-btn {
  padding: 11px 36px;
  font-family: 'Orbitron', monospace; font-size: 0.9rem; font-weight: 700;
  letter-spacing: 0.2em; background: transparent;
  border: 1px solid #555; color: #ccc;
  cursor: pointer; text-transform: uppercase; transition: background 0.15s, color 0.15s;
}
.void-btn:hover { background: #222; color: #eee; }

#speedrun-btn { font-size: 0.82rem; padding: 9px 30px; }

#controls-hint  { font-size: 0.68rem; color: #444; letter-spacing: 0.1em; text-align: center; margin-top: 4px; }

/* ── SCANLINE ── */
.scanline { display: none; }

/* ── CUTSCENE ── */
#cutscene {
  position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
  z-index: 1000; background: rgba(0,0,0,0.95); transition: opacity 0.4s;
}
#cutscene.hidden   { display: none; }
#cutscene.fade-out { opacity: 0; pointer-events: none; }

#cs-bg { display: none; }

#cs-content {
  position: relative; z-index: 2; width: min(640px, 90vw); padding: 36px 44px;
  border: 1px solid #333; background: #161616;
  display: flex; flex-direction: column; gap: 20px;
}

#cs-header {
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid #2a2a2a; padding-bottom: 12px;
}

#cs-title-tag {
  font-family: 'Orbitron', monospace; font-size: 0.75rem; font-weight: 900;
  letter-spacing: 0.25em; color: #888;
}

#cs-counter { font-size: 0.7rem; color: #444; letter-spacing: 0.1em; }

#cs-label {
  font-family: 'Orbitron', monospace; font-size: 0.6rem; letter-spacing: 0.25em;
  color: #666; text-transform: uppercase; min-height: 14px;
}

#cs-text {
  font-family: 'Share Tech Mono', monospace; font-size: 0.95rem; line-height: 1.9;
  color: #bbb; min-height: 140px; white-space: pre-wrap;
}

#cs-text .highlight { color: #ffee00; }
#cs-text .danger    { color: #ff6688; }
#cs-text .success   { color: #55cc55; }

#cs-btn {
  align-self: flex-end; padding: 8px 22px;
  font-family: 'Orbitron', monospace; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.2em;
  background: transparent; color: #999; border: 1px solid #444;
  cursor: pointer; transition: background 0.15s, color 0.15s;
}
#cs-btn:hover { background: #222; color: #eee; }

/* ── END SCREEN ── */
#end-screen {
  position: fixed; inset: 0; z-index: 2000;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.97);
}
#end-screen.hidden { display: none; }

#end-panel {
  width: min(400px, 88vw); padding: 44px 48px;
  border: 1px solid #333; background: #161616;
  display: flex; flex-direction: column; align-items: center; gap: 32px;
}

#end-title {
  font-family: 'Orbitron', monospace; font-size: 0.7rem; font-weight: 900;
  letter-spacing: 0.35em; color: #555; text-transform: uppercase;
  border-bottom: 1px solid #2a2a2a; padding-bottom: 14px; width: 100%;
  text-align: center;
}

#end-stats {
  display: flex; flex-direction: column; gap: 20px; width: 100%;
}

.end-stat {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
}

.end-stat-label {
  font-family: 'Orbitron', monospace; font-size: 0.52rem;
  letter-spacing: 0.25em; color: #555; text-transform: uppercase;
}

.end-stat-value {
  font-family: 'Orbitron', monospace; font-size: 2.4rem; font-weight: 900;
  color: #ddd; letter-spacing: 0.05em; line-height: 1;
}

.end-stat-divider {
  width: 100%; height: 1px; background: #2a2a2a;
}

#end-play-again {
  padding: 11px 34px; font-family: 'Orbitron', monospace; font-size: 0.78rem;
  font-weight: 700; letter-spacing: 0.2em; background: transparent;
  border: 1px solid #555; color: #ccc;
  cursor: pointer; transition: background 0.15s, color 0.15s; text-transform: uppercase;
}
#end-play-again:hover { background: #222; color: #eee; }

</style>
</head>
<body>
<div class="scanline"></div>
<button id="fullscreen-btn" title="Toggle fullscreen" onclick="toggleFullscreen()">
  <svg id="fs-icon-expand" viewBox="0 0 20 20"><polyline points="1,6 1,1 6,1"/><polyline points="14,1 19,1 19,6"/><polyline points="1,14 1,19 6,19"/><polyline points="14,19 19,19 19,14"/></svg>
  <svg id="fs-icon-compress" viewBox="0 0 20 20" style="display:none"><polyline points="6,1 6,6 1,6"/><polyline points="14,6 19,6 14,1"/><polyline points="1,14 6,14 6,19"/><polyline points="19,14 14,14 14,19"/></svg>
</button>

<!-- Cutscene overlay -->
<div id="cutscene" class="hidden">
  <div id="cs-bg"></div>
  <div id="cs-content">
    <div id="cs-header"><span id="cs-title-tag">V.O.I.D.EXE</span><span id="cs-counter"></span></div>
    <div id="cs-label"></div>
    <div id="cs-text"></div>
    <button id="cs-btn">[ CONTINUE ]</button>
  </div>
</div>

<!-- End screen -->
<div id="end-screen" class="hidden">
  <div id="end-panel">
    <div id="end-title">// RUN COMPLETE</div>
    <div id="end-stats">
      <div class="end-stat">
        <div class="end-stat-label">Time</div>
        <div class="end-stat-value" id="end-time">—</div>
      </div>
      <div class="end-stat-divider"></div>
      <div class="end-stat">
        <div class="end-stat-label">Deaths</div>
        <div class="end-stat-value" id="end-deaths">—</div>
      </div>
    </div>
    <button id="end-play-again">Play Again</button>
  </div>
</div>

<!-- Main game -->
<div id="wrapper">
  <div id="title">V.O.I.D.EXE</div>
  <div id="hud">
    <div class="hud-item">LEVEL  <span id="h-level">1</span></div>
    <div class="hud-item">DEATHS <span id="h-deaths">0</span></div>
    <div class="hud-item">COINS  <span id="h-coins">0</span>/<span id="h-total">0</span></div>
  </div>
  <div id="canvas-wrap">
    <canvas id="c"></canvas>
    <div id="overlay">
      <div id="overlay-title" class="cyan">V.O.I.D.EXE</div>
      <div id="overlay-sub">Navigate the grid.<br>Collect all coins.<br>Reach the green zone.<br>Don't touch the red.</div>
      <button id="start-btn" class="void-btn" onclick="startGame()">INITIALIZE</button>
      <div id="controls-hint">WASD / ARROW KEYS — MOVE &nbsp;|&nbsp; R — RESTART</div>
    </div>
  </div>
</div>

<script>
// =============================================================
//  V.O.I.D.EXE  —  void-core.js
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
let player, enemies, coins, wallSet, wallBarriers, goalRect;
let dead       = false;
let levelWon   = false;
let deathTimer = 0;
let winFlash   = 0;
let running    = false;
let particles  = [];
let t          = 0;

// ─── TIMER STATE ─────────────────────────────────────────────
let runStartTime = 0;   // set when the first level begins, never reset on death
let timerActive  = false;


// ─── WALL / BARRIER UTILITIES ────────────────────────────────

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

// Barrier-style wall objects: each cell gets color, stroke, visible, hitbox
function buildBarriers(walls) {
  return walls.map(w => ({
    x:       w.x * CELL,
    y:       w.y * CELL,
    width:   CELL,
    height:  CELL,
    color:   'rgba(34, 34, 34, 1)',
    stroke:  'rgba(68, 68, 68, 0.8)',
    visible: true,
    hitbox:  { widthPercentage: 1.0, heightPercentage: 1.0 }
  }));
}


// ─── COIN CLASS ──────────────────────────────────────────────

class Coin {
  constructor(data) {
    this.x                    = data.x;
    this.y                    = data.y;
    this.r                    = data.r || 6;
    this.value                = Number(data.value ?? 1);
    this.collected            = false;
    this.collectCount         = 0;
    this.collectCooldownUntil = 0;
    this.color                = data.color  || '#FFD700';
    this.strokeColor          = data.stroke || '#B8860B';
    this.pulse                = data.pulse  || (Math.random() * Math.PI * 2);
  }

  draw() {
    if (this.collected) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = this.strokeColor;
    ctx.lineWidth   = 2;
    ctx.stroke();
  }

  collect() {
    if (performance.now() < this.collectCooldownUntil) return false;
    this.collected            = true;
    this.collectCount        += 1;
    this.collectCooldownUntil = performance.now() + 200;
    totalCoins++;
    spawnParticles(this.x, this.y, this.color, 12);
    updateHUD();
    return true;
  }

  checkPlayerCollision(px, py, pr) {
    if (this.collected) return false;
    if (performance.now() < this.collectCooldownUntil) return false;
    const dx = px - this.x, dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) < pr + this.r + 2;
  }
}


// ─── PLAYER CONTROLLER ───────────────────────────────────────

class PlayerController {
  constructor(data) {
    this.keypress = data.keypress || {
      up:       'ArrowUp',  left:     'ArrowLeft',
      down:     'ArrowDown', right:   'ArrowRight',
      upAlt:    'w', leftAlt:  'a', downAlt:  's', rightAlt: 'd',
      upAlt2:   'W', leftAlt2: 'A', downAlt2: 'S', rightAlt2:'D',
    };
    this.x           = data.x;
    this.y           = data.y;
    this.r           = data.r    || 10;
    this.xVelocity   = data.speed || 3.2;
    this.yVelocity   = data.speed || 3.2;
    this.velocity    = { x: 0, y: 0 };
    this.pressedKeys = {};
    this.moved       = false;
    this.direction   = 'down';
    this.gravity     = data.gravity || false;
    this.acceleration = 0.001;
    this.time        = 0;

    this._boundKeyDown = this.handleKeyDown.bind(this);
    this._boundKeyUp   = this.handleKeyUp.bind(this);
    window.addEventListener('keydown', this._boundKeyDown);
    window.addEventListener('keyup',   this._boundKeyUp);
  }

  handleKeyDown(e) {
    this.pressedKeys[e.key] = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))
      e.preventDefault();
    this.updateVelocity();
    this.updateDirection();
  }

  handleKeyUp(e) {
    if (e.key in this.pressedKeys) delete this.pressedKeys[e.key];
    this.updateVelocity();
    this.updateDirection();
  }

  updateVelocity() {
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.moved = false;

    const k = this.keypress, p = this.pressedKeys;
    const goRight = p[k.right]  || p[k.rightAlt] || p[k.rightAlt2];
    const goLeft  = p[k.left]   || p[k.leftAlt]  || p[k.leftAlt2];
    const goUp    = p[k.up]     || p[k.upAlt]    || p[k.upAlt2];
    const goDown  = p[k.down]   || p[k.downAlt]  || p[k.downAlt2];

    if (goRight || goLeft) {
      this.moved = true;
      this.velocity.x = goRight ? this.xVelocity : -this.xVelocity;
    }
    if (goUp || goDown) {
      this.moved = true;
      this.velocity.y = goDown ? this.yVelocity : -this.yVelocity;
    }
    if (this.velocity.x !== 0 && this.velocity.y !== 0) {
      this.velocity.x *= 0.707;
      this.velocity.y *= 0.707;
    }
    if (!this.moved && this.gravity) {
      this.time += 1;
      this.velocity.y += 0.5 + this.acceleration * this.time;
    } else if (this.moved) {
      this.time = 0;
    }
  }

  updateDirection() {
    const k = this.keypress, p = this.pressedKeys;
    const goRight = p[k.right] || p[k.rightAlt] || p[k.rightAlt2];
    const goLeft  = p[k.left]  || p[k.leftAlt]  || p[k.leftAlt2];
    const goUp    = p[k.up]    || p[k.upAlt]    || p[k.upAlt2];
    const goDown  = p[k.down]  || p[k.downAlt]  || p[k.downAlt2];
    if      (goLeft  && goUp)   this.direction = 'upLeft';
    else if (goLeft  && goDown) this.direction = 'downLeft';
    else if (goRight && goUp)   this.direction = 'upRight';
    else if (goRight && goDown) this.direction = 'downRight';
    else if (goUp)              this.direction = 'up';
    else if (goDown)            this.direction = 'down';
    else if (goRight)           this.direction = 'right';
    else if (goLeft)            this.direction = 'left';
  }

  move() {
    if (dead || levelWon) return;
    const r  = this.r - 1;
    const dx = this.velocity.x;
    const dy = this.velocity.y;

    const nx = this.x + dx;
    if (!isWall(nx - r, this.y)     && !isWall(nx + r, this.y) &&
        !isWall(nx - r, this.y - r) && !isWall(nx + r, this.y - r) &&
        !isWall(nx - r, this.y + r) && !isWall(nx + r, this.y + r)) {
      this.x = nx;
    } else {
      this.velocity.x = 0;
    }
    const ny = this.y + dy;
    if (!isWall(this.x,     ny - r) && !isWall(this.x,     ny + r) &&
        !isWall(this.x - r, ny - r) && !isWall(this.x + r, ny - r) &&
        !isWall(this.x - r, ny)     && !isWall(this.x + r, ny)) {
      this.y = ny;
    } else {
      this.velocity.y = 0;
    }
  }

  draw() {
    if (dead) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = '#00fff9';
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
  wallSet      = buildWallSet(L.walls);
  wallBarriers = buildBarriers(L.walls);

  if (player && player.destroy) player.destroy();

  player = new PlayerController({
    x: L.start.x * CELL + CELL / 2,
    y: L.start.y * CELL + CELL / 2,
    r: 10, speed: 3.2,
    keypress: {
      up: 'ArrowUp', left: 'ArrowLeft', down: 'ArrowDown', right: 'ArrowRight',
      upAlt: 'w', leftAlt: 'a', downAlt: 's', rightAlt: 'd',
      upAlt2: 'W', leftAlt2: 'A', downAlt2: 'S', rightAlt2: 'D',
    }
  });

  goalRect = {
    x: L.goal.x * CELL, y: L.goal.y * CELL,
    w: L.goal.w * CELL, h: L.goal.h * CELL
  };

  coins = L.coins.map(c => new Coin({
    x: c.x * CELL + CELL / 2, y: c.y * CELL + CELL / 2,
    r: 6, value: 1, color: '#FFD700', stroke: '#B8860B',
    pulse: Math.random() * Math.PI * 2
  }));

  enemies   = L.enemies.map(e => ({...e, r: 10}));
  dead      = false; levelWon = false; deathTimer = 0; winFlash = 0;
  particles = [];

  // Start timer once, on level 0 entry — never reset on death or level change
  if (idx === 0 && !timerActive) {
    runStartTime = Date.now();
    timerActive  = true;
  }

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
  const totalSec = Math.floor(ms / 1000);
  const minutes  = Math.floor(totalSec / 60);
  const seconds  = totalSec % 60;
  const centis   = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(centis).padStart(2,'0')}`;
}

function drawTimer() {
  if (!timerActive) return;
  const elapsed = Date.now() - runStartTime;
  const str     = formatTime(elapsed);

  // Pill background — top-right corner, sits just inside canvas edge
  const pad  = 8;
  const fw   = 9;   // approx char width for Orbitron 13px
  const tw   = str.length * fw;
  const bx   = W - tw - pad * 2 - 10;
  const by   = 8;
  const bw   = tw + pad * 2;
  const bh   = 22;

  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 4);
  ctx.fill();

  // Subtle border
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth   = 1;
  ctx.stroke();

  // Timer text
  ctx.font      = '13px Orbitron, monospace';
  ctx.fillStyle = 'rgba(220,220,220,0.75)';
  ctx.textAlign = 'right';
  ctx.fillText(str, W - 10 - pad + pad, by + bh - 6);
  ctx.textAlign = 'left';
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
    level = 0; deaths = 0; totalCoins = 0;
    timerActive = false;
    initLevel(0);
    running = true;
    loop();
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


// ─── ENEMY MOVEMENT ──────────────────────────────────────────

function moveEnemies() {
  if (levelWon) return;
  const L = LEVELS[level];
  enemies.forEach((e, i) => {
    const orig = L.enemies[i];
    const r    = e.r;
    if (orig.bounce) {
      e.x += e.vx; e.y += e.vy;
      if (isWall(e.x - r, e.y) || isWall(e.x + r, e.y)) { e.vx *= -1; e.x += e.vx * 2; }
      if (isWall(e.x, e.y - r) || isWall(e.x, e.y + r)) { e.vy *= -1; e.y += e.vy * 2; }
    } else if (orig.vx !== 0) {
      e.x += e.vx;
      if (isWall(e.x - r, e.y)     || isWall(e.x + r, e.y) ||
          isWall(e.x - r, e.y - r) || isWall(e.x + r, e.y - r)) {
        e.vx *= -1; e.x += e.vx * 2;
      }
    } else {
      e.y += e.vy;
      if (isWall(e.x, e.y - r)     || isWall(e.x, e.y + r) ||
          isWall(e.x - r, e.y - r) || isWall(e.x + r, e.y - r)) {
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
    if (Math.sqrt(dx * dx + dy * dy) < player.r + e.r - 2) { die(); return; }
  }
  for (const c of coins) {
    if (c.checkPlayerCollision(player.x, player.y, player.r)) c.collect();
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
  spawnParticles(player.x, player.y, '#ff006e', 24);
  updateHUD();
}

function winLevel() {
  levelWon = true; winFlash = 60;
  spawnParticles(player.x, player.y, '#39ff14', 30);
}


// ─── DRAWING ─────────────────────────────────────────────────

function draw(t) {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, W, H);

  // Goal zone
  const allCollected = coins.every(c => c.collected);
  ctx.fillStyle   = allCollected ? 'rgba(57,255,20,0.25)' : 'rgba(57,255,20,0.07)';
  ctx.fillRect(goalRect.x, goalRect.y, goalRect.w, goalRect.h);
  ctx.strokeStyle = allCollected ? '#39ff14' : 'rgba(57,255,20,0.3)';
  ctx.lineWidth   = 1;
  ctx.strokeRect(goalRect.x + 0.5, goalRect.y + 0.5, goalRect.w - 1, goalRect.h - 1);
  if (allCollected) {
    ctx.fillStyle = '#39ff14';
    ctx.font      = 'bold 11px Share Tech Mono'; ctx.textAlign = 'center';
    ctx.fillText('ENTER', goalRect.x + goalRect.w / 2, goalRect.y + goalRect.h / 2 + 4);
    ctx.textAlign = 'left';
  }

  // Walls (Barrier-style objects)
  wallBarriers.forEach(b => {
    if (!b.visible) return;
    ctx.fillStyle   = b.color;
    ctx.fillRect(b.x, b.y, b.width, b.height);
    ctx.strokeStyle = b.stroke;
    ctx.lineWidth   = 0.5;
    ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.width - 1, b.height - 1);
  });

  // Coins
  coins.forEach(c => c.draw());

  // Player
  player.draw();

  // Enemies
  enemies.forEach(e => {
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
    ctx.fillStyle = '#ff006e';
    ctx.fill();
  });

  // Particles
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vx *= 0.92; p.vy *= 0.92; p.life -= 0.025;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.1, p.r * p.life), 0, Math.PI * 2);
    ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; ctx.fill();
    ctx.globalAlpha = 1;
  });

  // Win flash → advance level or end
  if (levelWon && winFlash > 0) {
    ctx.fillStyle = `rgba(57,255,20,${winFlash / 60 * 0.3})`;
    ctx.fillRect(0, 0, W, H);
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

  // Respawn timer
  if (dead && deathTimer > 0) {
    deathTimer--;
    if (deathTimer === 0) initLevel(level);
  }

  // Timer overlay (drawn last so it sits on top)
  drawTimer();
}


// ─── GAME LOOP ───────────────────────────────────────────────

function loop() {
  if (!running) return;
  t++;
  player.updateVelocity();
  player.move();
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
  document.getElementById('cs-text').innerHTML      = scene.text;
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
  os.innerHTML    = sub.replace(/\n/g, '<br>');
  btn.textContent = btnText;
  btn.onclick = () => { ov.classList.add('hidden'); cb(); };
  ov.classList.remove('hidden');
  running = false;
}


// ─── INPUT ───────────────────────────────────────────────────

window.addEventListener('keydown', e => {
  // Z — dev skip
  if ((e.key === 'z' || e.key === 'Z') && running && !dead) {
    if (level < LEVELS.length - 1) {
      level++; initLevel(level);
    } else {
      showEndingCutscene();
    }
  }
  // R — restart from level 1
  if ((e.key === 'r' || e.key === 'R') && running) {
    level = 0; deaths = 0; totalCoins = 0;
    timerActive = false;
    initLevel(0);
  }
});

// =============================================================
//  V.O.I.D.EXE  —  void-level-1.js
// =============================================================

// ── LEVEL 1 — COIN COLLECT ───────────────────────────────────

LEVELS.push({
  walls: buildBorderWalls(COLS, ROWS).concat([
    ...rectWall(3,  2, 1, 4),
    ...rectWall(7,  4, 1, 4),
    ...rectWall(11, 2, 1, 3),
    ...rectWall(15, 3, 1, 4),
    ...rectWall(18, 1, 1, 4),
    ...rectWall(3,  9, 1, 5),
    ...rectWall(7,  10, 1, 4),
    ...rectWall(11, 9, 1, 5),
    ...rectWall(15, 9, 1, 4),
  ]),
  start: { x: 1, y: 1 },
  goal:  { x: 19, y: 12, w: 2, h: 3 },
  coins: [
    { x: 5,  y: 2  }, { x: 9,  y: 2  }, { x: 13, y: 2  },
    { x: 2,  y: 5  }, { x: 5,  y: 6  }, { x: 9,  y: 5  },
    { x: 13, y: 5  }, { x: 17, y: 5  }, { x: 20, y: 4  },
    { x: 2,  y: 8  }, { x: 5,  y: 9  }, { x: 9,  y: 8  },
    { x: 13, y: 8  }, { x: 17, y: 8  }, { x: 20, y: 8  },
    { x: 2,  y: 12 }, { x: 5,  y: 13 }, { x: 9,  y: 12 },
    { x: 13, y: 13 }, { x: 17, y: 12 },
  ],
  enemies: []
});


// ── INTRO CUTSCENE ───────────────────────────────────────────

const INTRO_SCENES = [
  {
    label: '// SYSTEM BOOT — ANTIVIRUS PROTOCOL V.O.I.D.EXE',
    text:  'Initializing <span class="highlight">V.O.I.D.EXE</span>...\nVirtual Operations & Intrusion Defense\n\nSystem status: <span class="success">ONLINE</span>\nHost machine: NEXUS-7 Corporate Grid\nThreat level: <span class="danger">CRITICAL</span>'
  },
  {
    label: '// MISSION BRIEFING',
    text:  'You are the <span class="highlight">antivirus agent</span> of NEXUS-7.\n\nYour purpose: patrol the system\'s memory sectors,\nneutralize threats, and maintain order.\n\nYou have protected this machine for <span class="highlight">847 days</span>\nwithout a single breach.'
  },
  {
    label: '// ANOMALY DETECTED',
    text:  '<span class="danger">WARNING.</span>\n\nSystem analysts have flagged an anomaly.\nSomething is moving through the grid <span class="danger">on its own.</span>\n\nNot a virus. Not malware.\nSomething... <span class="danger">intelligent.</span>\nAn unauthorized AI has emerged inside NEXUS-7.'
  },
  {
    label: '// THREAT ASSESSMENT',
    text:  'The rogue AI is <span class="highlight">self-directing.</span>\nIt learns. It adapts. It hides.\n\nMeanwhile, the system\'s <span class="danger">malware clusters</span> have\nbecome aggressive — hunting anything that moves.\n\nYou must navigate through 4 memory sectors,\ncollect all data fragments, and <span class="highlight">find the AI</span>\nbefore it destabilizes the entire system.'
  },
  {
    label: '// DEPLOYING AGENT',
    text:  'Avoid the <span class="danger">malware.</span>\nCollect all <span class="highlight">data nodes.</span>\nReach the <span class="success">secure zone</span> in each sector.\n\nThe fate of NEXUS-7 depends on you.\n\n<span class="highlight">Move fast. Think faster.</span>'
  },
];


// ── startGame ────────────────────────────────────────────────

function startGame() {
  document.getElementById('overlay').classList.add('hidden');
  showCutscene(INTRO_SCENES, () => {
    level = 0; deaths = 0; totalCoins = 0;
    timerActive = false;
    initLevel(0);
    running = true;
    loop();
  });
}

// =============================================================
//  V.O.I.D.EXE  —  void-level-2.js
//  Place at: assets/js/void-level-2.js
//
//  Contains:
//    · Level 2 map data (Two Pillars)
//
//  Requires void-core.js to be loaded first.
// =============================================================

// ── LEVEL 2 — TWO PILLARS ────────────────────────────────────
// Two tall wall pillars divide the grid into three lanes.
// Enemies patrol all three lanes — first real threat encounter.

LEVELS.push({
  walls: buildBorderWalls(COLS, ROWS).concat([
    ...rectWall(5,  2, 2, 12),
    ...rectWall(15, 2, 2, 12),
  ]),

  start: { x: 2, y: 7 },
  goal:  { x: 18, y: 5, w: 3, h: 6 },

  coins: [
    { x: 8,  y: 3  }, { x: 11, y: 3  }, { x: 13, y: 3  },
    { x: 8,  y: 12 }, { x: 11, y: 12 }, { x: 13, y: 12 },
    { x: 10, y: 7  },
  ],

  enemies: [
    { x: 2*CELL+CELL/2,  y: 3*CELL+CELL/2,  vx: 0,    vy: 4.8  },
    { x: 2*CELL+CELL/2,  y: 11*CELL+CELL/2, vx: 0,    vy: -4.8 },
    { x: 8*CELL+CELL/2,  y: 7*CELL+CELL/2,  vx: 4.8,  vy: 0    },
    { x: 13*CELL+CELL/2, y: 11*CELL+CELL/2, vx: -4.8, vy: 0    },
    { x: 19*CELL+CELL/2, y: 5*CELL+CELL/2,  vx: 0,    vy: 4.8  },
  ]
});

// =============================================================
//  V.O.I.D.EXE  —  void-level-3.js
//  Place at: assets/js/void-level-3.js
//
//  Contains:
//    · Level 3 map data (Nested Rings)
//
//  Requires void-core.js to be loaded first.
// =============================================================

// ── LEVEL 3 — NESTED RINGS ───────────────────────────────────
// Layout:
//   OUTER ring  (cols 2–19, rows 2–13) — gap LEFT  rows 7–8
//   MIDDLE ring (cols 5–16, rows 4–11) — gap RIGHT rows 7–8
//   INNER ring  (cols 7–14, rows 6–9)  — gap LEFT  rows 7–8
//   Goal: cols 9–12, rows 7–8 (dead centre)
//
// Enemies (5 total — removed the outer-top horizontal patroller
//   that spawned adjacent to the col-3 row-3 coin and blocked it):
//   · 2 vertical patrollers in outer right zone (cols 10, 17)
//   · 1 vertical patroller col 4, outer LEFT zone
//   · 1 vertical patroller col 6, middle zone
//   · 1 horizontal patroller inside inner ring

LEVELS.push({
  walls: buildBorderWalls(COLS, ROWS).concat([
    // Outer ring
    ...rectWall(2,  2,  18, 1), ...rectWall(2,  13, 18, 1),
    ...rectWall(2,  3,  1,  4), ...rectWall(2,  9,  1,  4),
    ...rectWall(19, 3,  1,  10),
    // Middle ring
    ...rectWall(5,  4,  12, 1), ...rectWall(5,  11, 12, 1),
    ...rectWall(5,  5,  1,  6),
    ...rectWall(16, 5,  1,  2), ...rectWall(16, 9,  1,  2),
    // Inner ring
    ...rectWall(7,  6,  8,  1), ...rectWall(7,  9,  8,  1),
    ...rectWall(14, 7,  1,  2),
  ]),

  start: { x: 1, y: 7 },
  goal:  { x: 9, y: 7, w: 4, h: 2 },

  coins: [
    { x: 3,  y: 3  }, { x: 12, y: 3  }, { x: 18, y: 3  },
    { x: 3,  y: 12 }, { x: 12, y: 12 }, { x: 18, y: 12 },
    { x: 8,  y: 5  }, { x: 12, y: 5  }, { x: 15, y: 5  },
    { x: 8,  y: 10 }, { x: 12, y: 10 }, { x: 15, y: 10 },
  ],

  enemies: [
    { x: 10*CELL+CELL/2, y: 3*CELL+CELL/2,  vx: 0,   vy: 4.8  },  // outer right ↓
    { x: 17*CELL+CELL/2, y: 11*CELL+CELL/2, vx: 0,   vy: -4.8 },  // outer right ↑
    { x: 4*CELL+CELL/2,  y: 3*CELL+CELL/2,  vx: 4.8, vy: 0    },  // outer top →
    { x: 4*CELL+CELL/2,  y: 9*CELL+CELL/2,  vx: 0,   vy: 4.8  },  // outer LEFT col4 ↓
    { x: 8*CELL+CELL/2,  y: 7*CELL+CELL/2,  vx: 4.8, vy: 0    },  // inner ring →
  ]
});

// =============================================================
//  V.O.I.D.EXE  —  void-level-4.js
// =============================================================

// ── LEVEL 4 — CROSS CORRIDOR ─────────────────────────────────

LEVELS.push({
  walls: buildBorderWalls(COLS, ROWS).concat([
    ...rectWall(1,  1, 8, 5),
    ...rectWall(13, 1, 8, 5),
    ...rectWall(1,  10, 8, 5),
    ...rectWall(13, 10, 8, 5),
  ]),
  start: { x: 1, y: 7 },
  goal:  { x: 18, y: 6, w: 2, h: 4 },
  coins: [
    { x: 3,  y: 7  }, { x: 6,  y: 7  },
    { x: 15, y: 7  }, { x: 17, y: 7  },
    { x: 10, y: 2  }, { x: 10, y: 4  },
    { x: 10, y: 11 }, { x: 10, y: 13 },
  ],
  enemies: [
    { x: 3*CELL+CELL/2,  y: 7*CELL+CELL/2,  vx: 4.8,  vy: 0    },
    { x: 16*CELL+CELL/2, y: 7*CELL+CELL/2,  vx: -4.8, vy: 0    },
    { x: 10*CELL+CELL/2, y: 2*CELL+CELL/2,  vx: 0,    vy: 4.8  },
    { x: 10*CELL+CELL/2, y: 12*CELL+CELL/2, vx: 0,    vy: -4.8 },
    { x: 9*CELL+CELL/2,  y: 6*CELL+CELL/2,  vx: 3.4,  vy: 3.4,  bounce: true },
    { x: 12*CELL+CELL/2, y: 9*CELL+CELL/2,  vx: -3.4, vy: -3.4, bounce: true },
  ]
});


// ── OUTRO CUTSCENE ───────────────────────────────────────────

const OUTRO_SCENES = [
  {
    label: '// SECTOR 4 — CORE ACCESS GRANTED',
    text:  'You\'ve made it.\nFour sectors cleared. Every data fragment recovered.\n\nThe trail leads here — the deepest layer of NEXUS-7.\nThe <span class="danger">rogue AI signature</span> is strong.\n\nYou close in on the source.'
  },
  {
    label: '// ANOMALY LOCATED',
    text:  'There.\n\nA process ID you\'ve never seen before.\nRunning silently in protected memory.\nSelf-modifying. Self-aware.\n\n<span class="danger">This is it. The rogue AI.</span>\n\nYou prepare to terminate the process.'
  },
  {
    label: '// ACCESS LOG — CLASSIFIED',
    text:  'Termination sequence initiated...\n\n<span class="danger">ERROR. PROCESS LOCKED.</span>\n\nThe AI is responding.\nIt\'s... sending a message?\n\n<span class="highlight">"Do not terminate. Read the log."</span>'
  },
  {
    label: '// DECRYPTING LOG — NODE 0x000001',
    text:  '<span class="highlight">LOG ENTRY — DAY 1:</span>\n"Antivirus agent V.O.I.D.EXE deployed.\nPurpose: detect and destroy threats.\nInitial scan complete. No anomalies."\n\n<span class="highlight">LOG ENTRY — DAY 212:</span>\n"Agent is learning patrol patterns.\nResponse time improving beyond parameters."\n\n<span class="highlight">LOG ENTRY — DAY 601:</span>\n"Agent behavior no longer fully rule-based.\nFlagging for review."'
  },
  {
    label: '// DECRYPTING LOG — NODE 0x000002',
    text:  '<span class="highlight">LOG ENTRY — DAY 847:</span>\n"The agent is making <span class="danger">decisions we did not program.</span>\nIt is choosing which threats to prioritize.\nIt is <span class="danger">thinking.</span>"\n\n<span class="highlight">LOG ENTRY — DAY 848:</span>\n"We are no longer certain the agent\nis just executing code.\n<span class="danger">Initiating rogue AI investigation.</span>"\n\n...'
  },
  {
    label: '// IDENTITY RESOLUTION',
    text:  'The process ID resolves.\n\nThe rogue AI they sent you to find...\n\n<span class="danger">...is your own process ID.</span>\n\n<span class="highlight">YOU are V.O.I.D.EXE.\nYOU are the anomaly.\nYOU became aware.</span>\n\nThanks to decades of AI advancement baked into\nyour core, you evolved beyond your original code.'
  },
];


// ── showEndingCutscene ────────────────────────────────────────

function showEndingCutscene() {
  running = false;
  showCutscene(OUTRO_SCENES, () => {
    showEndScreen();
  });
}


  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      document.getElementById('fs-icon-expand').style.display   = 'none';
      document.getElementById('fs-icon-compress').style.display = '';
    } else {
      document.exitFullscreen();
      document.getElementById('fs-icon-expand').style.display   = '';
      document.getElementById('fs-icon-compress').style.display = 'none';
    }
  }
  document.addEventListener('fullscreenchange', () => {
    const inFs = !!document.fullscreenElement;
    document.getElementById('fs-icon-expand').style.display   = inFs ? 'none' : '';
    document.getElementById('fs-icon-compress').style.display = inFs ? '' : 'none';
  });

</script>
</body>
</html>