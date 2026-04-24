import Character from '../essentials/Character.js';
import Player from '../essentials/Player.js';
import { getCellSize, gridCenterToPixel } from './HeistUtils.js';

export default class HeistGoal extends Character {
  constructor(data = {}, gameEnv) {
    super(data, gameEnv);
    const fallbackGrid = (gameEnv && gameEnv.heistGoal) ? gameEnv.heistGoal : { x: 0, y: 0, w: 1, h: 1 };
    this.grid = (data && (data.goalGrid || data.grid)) ? (data.goalGrid || data.grid) : fallbackGrid;
    
    // Final validation
    if (!this.grid || typeof this.grid.w !== 'number' || typeof this.grid.h !== 'number') {
      console.warn('HeistGoal: invalid grid dimensions, using fallback', this.grid);
      this.grid = { x: 0, y: 0, w: 1, h: 1 };
    }
    
    this.color = data.color || 'rgba(18, 180, 255, 0.25)';
    this.borderColor = data.borderColor || '#12b4ff';
    this.zIndex = data.zIndex || 5;
    this.canvas.style.zIndex = String(this.zIndex);
    this.alertCooldown = 0;
  }

  resize() {
    // Guard: ensure grid exists (needed because Character.resize() is called during construction before this.grid is set)
    if (!this.grid || typeof this.grid.w !== 'number' || typeof this.grid.h !== 'number') {
      this.grid = { x: 0, y: 0, w: 1, h: 1 };
      return;
    }
    
    const center = { x: this.position.x + this.width / 2, y: this.position.y + this.height / 2 };
    const cellSize = getCellSize(this.gameEnv);
    this.width = Math.max(18, Math.round(cellSize.width * this.grid.w));
    this.height = Math.max(18, Math.round(cellSize.height * this.grid.h));
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    const realCenter = gridCenterToPixel(this.gameEnv, this.grid.x + this.grid.w / 2, this.grid.y + this.grid.h / 2);
    this.position.x = realCenter.x - this.width / 2;
    this.position.y = realCenter.y - this.height / 2;
  }

  update() {
    this.draw();
    this.collisionChecks();
  }

  draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = this.borderColor;
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(2, 2, this.canvas.width - 4, this.canvas.height - 4);
    this.setupCanvas();
  }

  handleCollisionReaction(other) {
    const collected = this.gameEnv.stats?.coinsCollected || 0;
    const total = this.gameEnv.heistTotalGems || 0;
    if (other instanceof Player) {
      if (collected >= total) {
        if (this.gameEnv.gameControl) {
          this.gameEnv.gameControl.endLevel();
        }
      } else if (Date.now() > this.alertCooldown) {
        this.alertCooldown = Date.now() + 1200;
        alert(`Collect all ${total} packages first. You have ${collected}.`);
      }
    }
  }
}
