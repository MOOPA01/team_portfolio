// =============================================================
//  H.E.I.S.T.EXE  —  heist-core.js  (ES Module)
//  Ghost Protocol: Infiltration Engine
//  Integrated with GameEngine framework
// =============================================================

import { initNPCSystem } from './heist-npc.js';
import { initLeaderboard } from './heist-leaderboard.js';

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
let npc = null;
let leaderboard = null;
let currentRunScore = null;
let npcEntity = null; // NPC position on level 1

// ─── PRIVATE WALL HELPERS ────────────────────────────────────
function buildWallSet(walls) {
  return new Set(walls.map(w => `${w.x},${w.y}`));
}

// ─── GEM CLASS (logic adapted from Coin.js) ──────────────────
class Gem {
  constructor(data, ctx) {
    this.x     = data.x; this.y = data.y; this.r = data.r || 6;
    this.value = Number(data.value ?? 1);
    this.ctx = ctx;
    // From Coin.js: collection state machine fields
    this.collected            = false;
    this.collectCount         = 0;
    this.collectCooldownUntil = 0;
    this.color = data.color || '#00c8ff'; // no stroke — one solid color
  }
  
  draw() {
    if (this.collected || !this.ctx) return;
    const r = this.r;
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.beginPath();
    this.ctx.moveTo(0, -r * 1.4);
    this.ctx.lineTo(r, 0);
    this.ctx.lineTo(0,  r * 1.4);
    this.ctx.lineTo(-r, 0);
    this.ctx.closePath();
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.restore();
  }
  
  collect(onCollect) {
    if (performance.now() < this.collectCooldownUntil) return false;
    this.collected            = true;
    this.collectCooldownUntil = performance.now() + 200;
    this.collectCount        += 1;
    totalGems++;
    // REMOVED: spawnParticles(this.x, this.y, this.color, 14);
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
  constructor(data, isWallFunc) {
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
    this.isWall = isWallFunc;
    this._boundKeyDown = this.handleKeyDown.bind(this);
    this._boundKeyUp   = this.handleKeyUp.bind(this);
    window.addEventListener('keydown', this._boundKeyDown);
    window.addEventListener('keyup',   this._boundKeyUp);
  }
  
  handleKeyDown(e) {
    this.pressedKeys[e.key] = true;
  }
  
  handleKeyUp(e) {
    this.pressedKeys[e.key] = false;
  }
  
  updateVelocity() {
    this.velocity.x = 0;
    this.velocity.y = 0;
    const keys = this.pressedKeys;
    const up = keys['ArrowUp'] || keys['w'] || keys['W'];
    const dn = keys['ArrowDown'] || keys['s'] || keys['S'];
    const lt = keys['ArrowLeft'] || keys['a'] || keys['A'];
    const rt = keys['ArrowRight'] || keys['d'] || keys['D'];
    if (up) this.velocity.y -= this.yVelocity;
    if (dn) this.velocity.y += this.yVelocity;
    if (lt) this.velocity.x -= this.xVelocity;
    if (rt) this.velocity.x += this.xVelocity;
    // Diagonal speed normalization
    if (this.velocity.x !== 0 && this.velocity.y !== 0) {
      this.velocity.x *= 0.707;
      this.velocity.y *= 0.707;
    }
  }
  move() {
    const nextX = this.x + this.velocity.x;
    const nextY = this.y + this.velocity.y;
    if (!isWall(nextX, nextY)) this.x = nextX;
    if (!isWall(this.x, nextY)) this.y = nextY;
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.beginPath(); ctx.arc(0, 0, this.r, 0, Math.PI * 2);
    ctx.fillStyle = '#00e87a';
    ctx.fill();
    ctx.strokeStyle = '#00b860';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Eyes
    ctx.fillStyle = '#0a0e1a';
    ctx.beginPath(); ctx.arc(-3, -2, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3, -2, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  
  destroy() {
    window.removeEventListener('keydown', this._boundKeyDown);
    window.removeEventListener('keyup', this._boundKeyUp);
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
  
  // Initialize NPC entity on level 1 at a specific position
  if (idx === 0) {
    npcEntity = {
      x: 10.5 * CELL,  // Place NPC at grid position (10, 10)
      y: 10.5 * CELL,
      r: 8,
      color: '#ffdd00'
    };
    const hintEl = document.getElementById('npc-hint');
    if (hintEl) hintEl.classList.add('active');
  } else {
    npcEntity = null;
    const hintEl = document.getElementById('npc-hint');
    if (hintEl) hintEl.classList.remove('active');
  }
  
  // Reset NPC chat history
  if (npc) npc.reset();
  
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
  
  // Save score and display leaderboard
  currentRunScore = leaderboard.addScore('temp_player', totalMs, deaths);
  renderLeaderboard(currentRunScore);
  
  document.getElementById('end-play-again').onclick = () => {
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('canvas-wrap').style.display = '';
    level = 0; deaths = 0; totalGems = 0; timerActive = false;
    currentRunScore = null;
    initLevel(0); running = true; loop();
  };
}

// ─── LEADERBOARD RENDERING ───────────────────────────────────
function renderLeaderboard(currentScore) {
  const topScores = leaderboard.getTop5();
  const tableBody = document.querySelector('#leaderboard-table tbody');
  
  tableBody.innerHTML = '';
  
  if (topScores.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="4" id="leaderboard-empty">No scores yet. Be the first!</td>';
    tableBody.appendChild(emptyRow);
    return;
  }
  
  topScores.forEach((score, idx) => {
    const row = document.createElement('tr');
    if (currentScore && score.id === currentScore.id) {
      row.classList.add('current-player');
    }
    
    row.innerHTML = `
      <td class="rank">#${idx + 1}</td>
      <td class="name">${escapeHtml(score.name)}</td>
      <td class="time">${formatTime(score.time)}</td>
      <td class="deaths">${score.deaths}</td>
    `;
    tableBody.appendChild(row);
  });
}

// ─── PARTICLES (DISABLED - no visuals) ───────────────────────
function spawnParticles(x, y, color, count=18) {
  // Particles disabled - no visual effect
  return;
}

// ─── GUARDS (enemies) ────────────────────────────────────────
function moveGuards() {
  if (levelWon) return;
  
  guards.forEach((g) => {
    // If guard has vx/vy, move it (works for all existing levels)
    if (g.vx !== undefined || g.vy !== undefined) {
      if (g.vx === undefined) g.vx = 0;
      if (g.vy === undefined) g.vy = 0;
      
      // Try moving in X direction
      const nextX = g.x + g.vx;
      const nextY = g.y + g.vy;
      
      // Check if new position would collide with walls
      const canMoveX = !checkGuardWallCollision(nextX, g.y, g.r);
      const canMoveY = !checkGuardWallCollision(g.x, nextY, g.r);
      
      // Move in X if no collision
      if (canMoveX) {
        g.x = nextX;
      } else if (g.vx !== 0) {
        g.vx *= -1; // Bounce off wall in X
      }
      
      // Move in Y if no collision
      if (canMoveY) {
        g.y = nextY;
      } else if (g.vy !== 0) {
        g.vy *= -1; // Bounce off wall in Y
      }
      
      // Keep in bounds
      g.x = Math.max(g.r, Math.min(W - g.r, g.x));
      g.y = Math.max(g.r, Math.min(H - g.r, g.y));
    }
  });
}

// Check if a guard position collides with walls
function checkGuardWallCollision(gx, gy, gr) {
  // Check all wall cells in the area
  for (let x = Math.floor((gx - gr) / CELL); x <= Math.floor((gx + gr) / CELL); x++) {
    for (let y = Math.floor((gy - gr) / CELL); y <= Math.floor((gy + gr) / CELL); y++) {
      if (wallSet.has(`${x},${y}`)) {
        // Circle-rectangle collision
        const closestX = Math.max(x * CELL, Math.min(gx, (x + 1) * CELL));
        const closestY = Math.max(y * CELL, Math.min(gy, (y + 1) * CELL));
        const dx = gx - closestX;
        const dy = gy - closestY;
        if (dx * dx + dy * dy < gr * gr) {
          return true; // Collision detected
        }
      }
    }
  }
  return false;
}

// ─── COLLISION ───────────────────────────────────────────────
function checkCollisions() {
  if (dead || levelWon) return;
  for (const g of guards) {
    const dx = player.x - g.x, dy = player.y - g.y;
    if (Math.sqrt(dx*dx + dy*dy) < player.r + g.r) {
      die(); return;
    }
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
  // REMOVED: spawnParticles(player.x, player.y, '#ff3355', 28);
  updateHUD();
}

function winLevel() {
  levelWon = true; winFlash = 70;
  // REMOVED: spawnParticles(player.x, player.y, '#00e87a', 32);
  // REMOVED: spawnParticles(goalRect.x + goalRect.w/2, goalRect.y + goalRect.h/2, '#00fff9', 20);
  setTimeout(() => {
    level++;
    if (level >= LEVELS.length) {
      showEndScreen();
    } else {
      initLevel(level);
      running = true;
      loop();
    }
  }, 2000);
}

// ─── DRAW ────────────────────────────────────────────────────
function drawFloorGrid() {
  ctx.strokeStyle = 'rgba(30,60,100,0.2)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= W; x += CELL) {
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += CELL) {
    ctx.beginPath();
    ctx.moveTo(0, y); ctx.lineTo(W, y);
    ctx.stroke();
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

function drawNPCEntity() {
  if (!npcEntity) return;
  ctx.beginPath();
  ctx.arc(npcEntity.x, npcEntity.y, npcEntity.r, 0, Math.PI * 2);
  ctx.fillStyle = npcEntity.color;
  ctx.fill();
  ctx.strokeStyle = '#ccaa00';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Draw a small icon/indicator
  ctx.font = 'bold 12px Arial';
  ctx.fillStyle = '#0a0e1a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', npcEntity.x, npcEntity.y);
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
    ctx.font = 'bold 16px Orbitron, monospace'; ctx.fillStyle = '#00e87a';
    ctx.textAlign = 'center'; ctx.fillText('EXTRACT', goalRect.x + goalRect.w/2, goalRect.y + goalRect.h/2 + 6);
  }

  // Walls
  wallBarriers.forEach(b => {
    ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.width, b.height);
    ctx.strokeStyle = b.stroke; ctx.lineWidth = 1; ctx.strokeRect(b.x, b.y, b.width, b.height);
    ctx.strokeStyle = b.stroke; ctx.lineWidth = 0.5;
    for (let i = 0; i < b.width; i += 4) {
      ctx.beginPath(); ctx.moveTo(b.x + i, b.y); ctx.lineTo(b.x + i + 2, b.y + b.height); ctx.stroke();
    }
  });

    // Gems
    this.gems.forEach(g => g.draw());

  // Guards
  guards.forEach(g => drawGuard(g));

  // NPC Entity
  drawNPCEntity();

    // Player
    this.player.draw(this.ctx, this.dead);

  // Particles (now disabled)
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    p.x += p.vx; p.y += p.vy;
    p.life--; p.size *= 0.98;
  });

  // Win flash
  if (levelWon && winFlash > 0) {
    const alpha = (winFlash / 70) * 0.3;
    ctx.fillStyle = `rgba(0, 232, 122, ${alpha})`;
    ctx.fillRect(0, 0, W, H);
    winFlash--;
  }

  // Death flash
  if (dead && deathTimer > 0) {
    const alpha = (deathTimer / 70) * 0.3;
    ctx.fillStyle = `rgba(255, 51, 85, ${alpha})`;
    ctx.fillRect(0, 0, W, H);
    deathTimer--;
    if (deathTimer === 0) {
      initLevel(level);
      dead = false;
    }
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
      renderCutsceneSlide();
    } else {
      document.getElementById('cutscene').classList.add('fade-out');
      setTimeout(() => {
        document.getElementById('cutscene').classList.add('hidden');
        if (csOnComplete) csOnComplete();
      }, 600);
    }
  });
}

// ─── NPC SYSTEM BINDING ──────────────────────────────────────
function bindNPCSystem() {
  document.addEventListener('keydown', e => {
    if ((e.key === 'e' || e.key === 'E') && running && level === 0) {
      // Check if player is near NPC entity
      if (npcEntity) {
        const dx = player.x - npcEntity.x;
        const dy = player.y - npcEntity.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        if (distance < 50) { // Interaction radius
          toggleNPCChat();
        }
      }
    }
  });

  document.getElementById('npc-send-btn').addEventListener('click', sendNPCMessage);
  document.getElementById('npc-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendNPCMessage();
  });

  document.getElementById('npc-close-btn').addEventListener('click', closeNPCChat);
}

function toggleNPCChat() {
  const modal = document.getElementById('npc-modal');
  modal.classList.toggle('active');
  if (modal.classList.contains('active')) {
    document.getElementById('npc-input').focus();
    running = false; // Pause game
  } else {
    running = true; // Resume game
    loop();
  }
}

function closeNPCChat() {
  document.getElementById('npc-modal').classList.remove('active');
  running = true;
  loop();
}

function sendNPCMessage() {
  const input = document.getElementById('npc-input');
  const userText = input.value.trim();
  if (!userText) return;

  // Add user message
  npc.addMessage('user', userText);
  displayMessage('user', userText);
  input.value = '';

  // Generate and display bot response
  const response = npc.generateResponse(userText);
  setTimeout(() => {
    npc.addMessage('bot', response);
    displayMessage('bot', response);
  }, 300);

  document.getElementById('npc-input').focus();
}

function displayMessage(sender, text) {
  const container = document.getElementById('npc-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `npc-message ${sender}`;
  msgDiv.innerHTML = `<div class="npc-message-bubble">${escapeHtml(text)}</div>`;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ─── LEADERBOARD INPUT BINDING ───────────────────────────────
function bindLeaderboardInput() {
  const saveBtn = document.getElementById('save-name-btn');
  const nameInput = document.getElementById('player-name-input');
  
  saveBtn.addEventListener('click', () => {
    const playerName = nameInput.value.trim() || 'Anonymous';
    if (currentRunScore) {
      currentRunScore.name = playerName;
      leaderboard.entries = leaderboard.entries.map(e => 
        e.id === currentRunScore.id ? currentRunScore : e
      );
      leaderboard.saveLeaderboard();
      renderLeaderboard(currentRunScore);
      nameInput.value = '';
    }
  });
  
  nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveBtn.click();
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
  
  // Initialize NPC and Leaderboard
  npc = initNPCSystem();
  leaderboard = initLeaderboard();
  
  bindCutsceneBtn();
  bindNPCSystem();
  bindLeaderboardInput();
  
  // Dev skip key (Z) and restart key (R)
  window.addEventListener('keydown', e => {
    if ((e.key === 'z' || e.key === 'Z') && running && !dead) {
      level++; if (level >= LEVELS.length) { showEndScreen(); } else { initLevel(level); }
    }
    if ((e.key === 'r' || e.key === 'R') && running) {
      level = 0; deaths = 0; totalGems = 0; timerActive = false; currentRunScore = null;
      initLevel(0);
    }
  });
}

export function startGame() {
  document.getElementById('overlay').classList.add('hidden');
  showCutscene(_introScenes, () => {
    initLevel(0);
    running = true;
    loop();
  });
}
