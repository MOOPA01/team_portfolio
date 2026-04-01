// =============================================================
//  H.E.I.S.T.EXE  —  heist-core.js  (ES Module)
//  Ghost Protocol: Infiltration Engine
//  Integrated with GameEngine framework
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
    if (onCollect) onCollect(this);
    return true;
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
  
  move(dead, levelWon) {
    if (dead || levelWon) return;
    const r = this.r - 1, dx = this.velocity.x, dy = this.velocity.y;
    const nx = this.x + dx;
    if (!this.isWall(nx-r,this.y) && !this.isWall(nx+r,this.y) &&
        !this.isWall(nx-r,this.y-r) && !this.isWall(nx+r,this.y-r) &&
        !this.isWall(nx-r,this.y+r) && !this.isWall(nx+r,this.y+r)) this.x = nx;
    else this.velocity.x = 0;
    const ny = this.y + dy;
    if (!this.isWall(this.x,ny-r) && !this.isWall(this.x,ny+r) &&
        !this.isWall(this.x-r,ny-r) && !this.isWall(this.x+r,ny-r) &&
        !this.isWall(this.x-r,ny) && !this.isWall(this.x+r,ny)) this.y = ny;
    else this.velocity.y = 0;
  }
  
  draw(ctx, dead) {
    if (dead || !ctx) return;
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

// ─── HEIST GAME CLASS (GameEngine compatible) ────────────────
export class HeistGame {
  constructor(gameEnv) {
    this.gameEnv = gameEnv;
    this.canvas = gameEnv.gameCanvas;
    this.ctx = this.canvas.getContext('2d');
    
    // Game state
    this.level = 0;
    this.deaths = 0;
    this.totalGems = 0;
    this.player = null;
    this.guards = [];
    this.gems = [];
    this.wallSet = null;
    this.wallBarriers = [];
    this.goalRect = null;
    this.dead = false;
    this.levelWon = false;
    this.deathTimer = 0;
    this.winFlash = 0;
    this.running = false;
    this.particles = [];
    this.t = 0;
    this.runStartTime = 0;
    this.timerActive = false;
    
    // Cutscene state
    this.csQueue = [];
    this.csIndex = 0;
    this.csOnComplete = null;
    this._onEndingCutscene = null;
    this._introScenes = null;
    
    // Store instance for Game.js API
    window._heistGameInstance = this;
  }
  
  initialize() {
    this.canvas.width  = W;
    this.canvas.height = H;
    this.bindCutsceneBtn();
    this.setupKeyboardShortcuts();
  }
  
  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'z' || e.key === 'Z') && this.running && !this.dead) {
        if (this.level < LEVELS.length - 1) { 
          this.level++; 
          this.initLevel(this.level); 
        } else if (this._onEndingCutscene) { 
          this._onEndingCutscene(); 
        }
      }
      if ((e.key === 'r' || e.key === 'R') && this.running) {
        this.resetGame();
      }
    });
  }
  
  isWall(px, py) {
    return this.wallSet.has(`${Math.floor(px / CELL)},${Math.floor(py / CELL)}`);
  }
  
  buildBarriers(walls) {
    return walls.map(w => ({
      x: w.x * CELL, y: w.y * CELL, width: CELL, height: CELL,
      color: 'rgba(20,24,36,1)', stroke: 'rgba(80,100,160,0.5)',
      visible: true, hitbox: { widthPercentage: 1.0, heightPercentage: 1.0 }
    }));
  }
  
  initLevel(idx) {
    const L = LEVELS[idx];
    this.wallSet = buildWallSet(L.walls);
    this.wallBarriers = this.buildBarriers(L.walls);
    
    if (this.player && this.player.destroy) this.player.destroy();
    
    this.player = new PlayerController({
      x: L.start.x * CELL + CELL/2,
      y: L.start.y * CELL + CELL/2,
      r: 9,
      speed: 3.2,
    }, this.isWall.bind(this));
    
    this.goalRect = { 
      x: L.goal.x*CELL, 
      y: L.goal.y*CELL, 
      w: L.goal.w*CELL, 
      h: L.goal.h*CELL 
    };
    
    this.gems = L.gems.map(g => new Gem({
      x: g.x * CELL + CELL/2,
      y: g.y * CELL + CELL/2,
      r: g.r || 6,
      value: g.value || 1,
      color: g.color || '#00c8ff',
    }, this.ctx));
    
    this.guards = L.guards.map(g => ({...g, r: g.r || 10}));
    this.dead = false;
    this.levelWon = false;
    this.deathTimer = 0;
    this.winFlash = 0;
    this.particles = [];
    
    if (idx === 0 && !this.timerActive) { 
      this.runStartTime = Date.now(); 
      this.timerActive = true; 
    }
    
    this.updateHUD();
  }
  
  updateHUD() {
    const deathsEl = document.getElementById('h-deaths');
    const gemsEl = document.getElementById('h-gems');
    const totalEl = document.getElementById('h-total');
    const levelEl = document.getElementById('h-level');
    
    if (deathsEl) deathsEl.textContent = this.deaths;
    if (gemsEl) gemsEl.textContent = this.gems.filter(g => g.collected).length;
    if (totalEl) totalEl.textContent = this.gems.length;
    if (levelEl) levelEl.textContent = this.level + 1;
  }
  
  spawnParticles(x, y, color, count = 18) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI*2/count)*i + Math.random()*0.4;
      const speed = 1.5 + Math.random()*4;
      this.particles.push({
        x, y,
        vx: Math.cos(angle)*speed, 
        vy: Math.sin(angle)*speed,
        life: 1, 
        color, 
        r: 1.5 + Math.random()*3
      });
    }
  }
  
  moveGuards() {
    if (this.levelWon) return;
    const L = LEVELS[this.level];
    this.guards.forEach((g, i) => {
      const orig = L.guards[i], r = g.r;
      if (orig.patrol) {
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
        if (this.isWall(g.x-r,g.y)||this.isWall(g.x+r,g.y)) { g.vx*=-1; g.x+=g.vx*2; }
        if (this.isWall(g.x,g.y-r)||this.isWall(g.x,g.y+r)) { g.vy*=-1; g.y+=g.vy*2; }
      } else if (orig.vx !== 0) {
        g.x += g.vx;
        if (this.isWall(g.x-r,g.y)||this.isWall(g.x+r,g.y)||this.isWall(g.x-r,g.y-r)||this.isWall(g.x+r,g.y-r)) {
          g.vx *= -1; g.x += g.vx*2;
        }
      } else {
        g.y += g.vy;
        if (this.isWall(g.x,g.y-r)||this.isWall(g.x,g.y+r)||this.isWall(g.x-r,g.y-r)||this.isWall(g.x+r,g.y-r)) {
          g.vy *= -1; g.y += g.vy*2;
        }
      }
    });
  }
  
  checkCollisions() {
    if (this.dead || this.levelWon) return;
    
    for (const g of this.guards) {
      const dx = this.player.x - g.x, dy = this.player.y - g.y;
      if (Math.sqrt(dx*dx + dy*dy) < this.player.r + g.r - 2) { 
        this.die(); 
        return; 
      }
    }
    
    for (const gem of this.gems) {
      if (gem.checkPlayerCollision(this.player.x, this.player.y, this.player.r)) {
        gem.collect(() => {
          this.totalGems++;
          this.spawnParticles(gem.x, gem.y, gem.color, 14);
          this.updateHUD();
        });
      }
    }
    
    if (this.gems.every(g => g.collected) &&
        this.player.x > this.goalRect.x && this.player.x < this.goalRect.x + this.goalRect.w &&
        this.player.y > this.goalRect.y && this.player.y < this.goalRect.y + this.goalRect.h) {
      this.winLevel();
    }
  }
  
  die() {
    if (this.dead) return;
    this.dead = true;
    this.deaths++;
    this.deathTimer = 70;
    this.spawnParticles(this.player.x, this.player.y, '#ff3355', 28);
    this.updateHUD();
  }
  
  winLevel() {
    this.levelWon = true;
    this.winFlash = 70;
    this.spawnParticles(this.player.x, this.player.y, '#00e87a', 32);
    this.spawnParticles(this.goalRect.x + this.goalRect.w/2, this.goalRect.y + this.goalRect.h/2, '#00fff9', 20);
  }
  
  resetGame() {
    this.level = 0;
    this.deaths = 0;
    this.totalGems = 0;
    this.timerActive = false;
    this.initLevel(0);
  }
  
  showEndScreen() {
    this.timerActive = false;
    const totalMs = Date.now() - this.runStartTime;
    const endTimeEl = document.getElementById('end-time');
    const endDeathsEl = document.getElementById('end-deaths');
    const endScreenEl = document.getElementById('end-screen');
    const canvasWrapEl = document.getElementById('canvas-wrap');
    
    if (endTimeEl) endTimeEl.textContent = this.formatTime(totalMs);
    if (endDeathsEl) endDeathsEl.textContent = String(this.deaths);
    if (canvasWrapEl) canvasWrapEl.style.display = 'none';
    if (endScreenEl) endScreenEl.classList.remove('hidden');
    
    const playAgainBtn = document.getElementById('end-play-again');
    if (playAgainBtn) {
      playAgainBtn.onclick = () => {
        if (endScreenEl) endScreenEl.classList.add('hidden');
        if (canvasWrapEl) canvasWrapEl.style.display = '';
        this.resetGame();
        this.running = true;
      };
    }
  }
  
  formatTime(ms) {
    const s = Math.floor(ms/1000), m = Math.floor(s/60);
    return `${String(m).padStart(2,'0')}:${String(s%60).padStart(2,'0')}.${String(Math.floor((ms%1000)/10)).padStart(2,'0')}`;
  }
  
  drawFloorGrid() {
    this.ctx.strokeStyle = 'rgba(30,60,100,0.2)';
    this.ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += CELL) {
      this.ctx.beginPath(); 
      this.ctx.moveTo(x, 0); 
      this.ctx.lineTo(x, H); 
      this.ctx.stroke();
    }
    for (let y = 0; y <= H; y += CELL) {
      this.ctx.beginPath(); 
      this.ctx.moveTo(0, y); 
      this.ctx.lineTo(W, y); 
      this.ctx.stroke();
    }
  }
  
  drawGuard(g) {
    this.ctx.beginPath();
    this.ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
    this.ctx.fillStyle = '#cc2244';
    this.ctx.fill();
    this.ctx.strokeStyle = '#881133';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
  }
  
  drawTimer() {
    if (!this.timerActive) return;
    const str = this.formatTime(Date.now() - this.runStartTime);
    const pad=8, fw=9, tw=str.length*fw, bx=W-tw-pad*2-10, by=8, bw=tw+pad*2, bh=22;
    this.ctx.fillStyle = 'rgba(0,0,0,0.55)';
    this.ctx.beginPath();
    this.ctx.roundRect(bx, by, bw, bh, 4);
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(0,200,120,0.15)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    this.ctx.font = '13px Orbitron, monospace';
    this.ctx.fillStyle = 'rgba(0,230,140,0.85)';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(str, W-10-pad+pad, by+bh-6);
    this.ctx.textAlign = 'left';
  }
  
  draw() {
    // Background
    this.ctx.fillStyle = '#0a0e1a';
    this.ctx.fillRect(0, 0, W, H);
    this.drawFloorGrid();

    // Goal zone
    const allCollected = this.gems.every(g => g.collected);
    this.ctx.fillStyle = allCollected ? 'rgba(0,232,122,0.22)' : 'rgba(0,232,122,0.05)';
    this.ctx.fillRect(this.goalRect.x, this.goalRect.y, this.goalRect.w, this.goalRect.h);
    this.ctx.strokeStyle = allCollected ? '#00e87a' : 'rgba(0,232,122,0.25)';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(this.goalRect.x+0.5, this.goalRect.y+0.5, this.goalRect.w-1, this.goalRect.h-1);
    if (allCollected) {
      this.ctx.fillStyle = '#00e87a';
      this.ctx.font = 'bold 10px Share Tech Mono';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('EXTRACT', this.goalRect.x + this.goalRect.w/2, this.goalRect.y + this.goalRect.h/2 + 4);
      this.ctx.textAlign = 'left';
    }

    // Walls
    this.wallBarriers.forEach(b => {
      if (!b.visible) return;
      this.ctx.fillStyle = b.color;
      this.ctx.fillRect(b.x, b.y, b.width, b.height);
      this.ctx.strokeStyle = b.stroke;
      this.ctx.lineWidth = 0.5;
      this.ctx.strokeRect(b.x+0.5, b.y+0.5, b.width-1, b.height-1);
      this.ctx.strokeStyle = 'rgba(60,90,150,0.15)';
      this.ctx.beginPath();
      this.ctx.moveTo(b.x+2, b.y+2);
      this.ctx.lineTo(b.x+b.width-2, b.y+b.height-2);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(b.x+b.width-2, b.y+2);
      this.ctx.lineTo(b.x+2, b.y+b.height-2);
      this.ctx.stroke();
    });

    // Gems
    this.gems.forEach(g => g.draw());

    // Guards
    this.guards.forEach(g => this.drawGuard(g));

    // Player
    this.player.draw(this.ctx, this.dead);

    // Particles
    this.particles = this.particles.filter(p => p.life > 0);
    this.particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.91; p.vy *= 0.91; p.life -= 0.022;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, Math.max(0.1, p.r * p.life), 0, Math.PI * 2);
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fillStyle   = p.color;
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
    });

    // Win flash
    if (this.levelWon && this.winFlash > 0) {
      this.ctx.fillStyle = `rgba(0,232,122,${this.winFlash/70 * 0.28})`;
      this.ctx.fillRect(0, 0, W, H);
      this.winFlash--;
      if (this.winFlash === 0) {
        if (this.level < LEVELS.length - 1) { 
          this.level++; 
          this.initLevel(this.level); 
        } else if (this._onEndingCutscene) { 
          this._onEndingCutscene(); 
        }
      }
    }

    // Death flash
    if (this.dead && this.deathTimer > 0) {
      this.ctx.fillStyle = `rgba(255,30,60,${this.deathTimer/70 * 0.35})`;
      this.ctx.fillRect(0, 0, W, H);
      this.deathTimer--;
      if (this.deathTimer === 0) this.initLevel(this.level);
    }

    this.drawTimer();
  }
  
  update() {
    if (!this.running) return;
    this.t++;
    this.player.updateVelocity();
    this.player.move(this.dead, this.levelWon);
    this.moveGuards();
    this.checkCollisions();
    this.draw();
  }
  
  showCutscene(scenes, onComplete) {
    this.csQueue = scenes;
    this.csIndex = 0;
    this.csOnComplete = onComplete;
    const csEl = document.getElementById('cutscene');
    if (csEl) csEl.classList.remove('hidden', 'fade-out');
    this.renderCutsceneSlide();
  }
  
  renderCutsceneSlide() {
    const scene = this.csQueue[this.csIndex];
    const labelEl = document.getElementById('cs-label');
    const counterEl = document.getElementById('cs-counter');
    const textEl = document.getElementById('cs-text');
    const btnEl = document.getElementById('cs-btn');
    
    if (labelEl) labelEl.textContent = scene.label;
    if (counterEl) counterEl.textContent = `${this.csIndex+1} / ${this.csQueue.length}`;
    if (textEl) textEl.innerHTML = scene.text;
    if (btnEl) btnEl.textContent = (this.csIndex === this.csQueue.length - 1) ? '[ EXECUTE ]' : '[ CONTINUE ]';
  }
  
  bindCutsceneBtn() {
    const btnEl = document.getElementById('cs-btn');
    if (!btnEl) return;
    btnEl.removeEventListener('click', this._csHander);
    this._csHandler = () => {
      this.csIndex++;
      if (this.csIndex < this.csQueue.length) {
        const el = document.getElementById('cs-content');
        if (el) {
          el.style.opacity = '0.3';
          setTimeout(() => { 
            if (el) el.style.opacity = '1'; 
            this.renderCutsceneSlide(); 
          }, 300);
        }
      } else {
        const csEl = document.getElementById('cutscene');
        if (csEl) {
          csEl.classList.add('fade-out');
          setTimeout(() => {
            csEl.classList.add('hidden');
            csEl.classList.remove('fade-out');
            if (this.csOnComplete) this.csOnComplete();
          }, 600);
        }
      }
    };
    btnEl.addEventListener('click', this._csHandler);
  }
  
  destroy() {
    if (this.player && this.player.destroy) {
      this.player.destroy();
    }
  }
}


// ─── END SCREEN ──────────────────────────────────────────────
export function showEndScreen() {
  if (window._heistGameInstance) {
    window._heistGameInstance.showEndScreen();
  }
}

// ─── PUBLIC API ──────────────────────────────────────────────
export function initGame({ canvasId, introScenes, onEndingCutscene }) {
  if (!window._heistGameInstance) {
    console.error('HeistGame instance not initialized. Make sure to use with GameEngine.');
    return;
  }
  
  const heist = window._heistGameInstance;
  heist._introScenes = introScenes;
  heist._onEndingCutscene = onEndingCutscene;
  heist.initialize();
}

export function startGame() {
  if (!window._heistGameInstance) {
    console.error('HeistGame instance not initialized.');
    return;
  }
  
  const heist = window._heistGameInstance;
  const overlay = document.getElementById('overlay');
  if (overlay) overlay.classList.add('hidden');
  
  heist.showCutscene(heist._introScenes, () => {
    heist.resetGame();
    heist.running = true;
  });
}
