import Character from '../essentials/Character.js';
import { getCellSize, isWallAt, getGridBounds } from './HeistUtils.js';

export default class HeistBackground extends Character {
  constructor(data = {}, gameEnv) {
    super(data, gameEnv);
    this.color = data.color || '#0d0d0d';
    this.wallColor = data.wallColor || '#1f1f1f';
    this.lineColor = data.lineColor || 'rgba(255,255,255,0.05)';
    this.gridColor = data.gridColor || 'rgba(255,255,255,0.04)';
    this.textColor = data.textColor || '#7ae0ff';
    this.zIndex = data.zIndex || 0;
    this.canvas.style.zIndex = String(this.zIndex);
    this.update();
  }

  update() {
    this.draw();
  }

  resize() {
    const bounds = getGridBounds(this.gameEnv);
    this.width = Math.round(this.gameEnv.innerWidth);
    this.height = Math.round(this.gameEnv.innerHeight);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.position = { x: 0, y: 0 };
    this.scale = { width: this.gameEnv.innerWidth, height: this.gameEnv.innerHeight };
  }

  draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.drawWalls();
    this.drawGoal();
    this.drawLevelInfo();
  }

  drawGrid() {
    const { width: cellWidth, height: cellHeight } = getCellSize(this.gameEnv);
    this.ctx.strokeStyle = this.gridColor;
    this.ctx.lineWidth = 1;
    for (let x = 0; x <= this.canvas.width; x += cellWidth) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y <= this.canvas.height; y += cellHeight) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  drawWalls() {
    const { width: cellWidth, height: cellHeight } = getCellSize(this.gameEnv);
    for (let y = 0; y < 16; y += 1) {
      for (let x = 0; x < 22; x += 1) {
        if (isWallAt(this.gameEnv, x, y)) {
          this.ctx.fillStyle = this.wallColor;
          this.ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        }
      }
    }
  }

  drawGoal() {
    const goal = this.gameEnv.heistGoal;
    if (!goal) return;
    const { width: cellWidth, height: cellHeight } = getCellSize(this.gameEnv);
    this.ctx.fillStyle = 'rgba(18, 180, 255, 0.35)';
    this.ctx.fillRect(goal.x * cellWidth, goal.y * cellHeight, goal.w * cellWidth, goal.h * cellHeight);
  }

  drawLevelInfo() {
    this.ctx.font = 'bold 18px sans-serif';
    this.ctx.fillStyle = this.textColor;
    this.ctx.fillText(`HEIST LEVEL: ${this.gameEnv.heistLevelName || 'UNKNOWN'}`, 14, 26);
    this.ctx.fillText(`Packages: ${this.gameEnv.stats?.coinsCollected || 0}/${this.gameEnv.heistTotalGems || 0}`, 14, 46);
  }
}
