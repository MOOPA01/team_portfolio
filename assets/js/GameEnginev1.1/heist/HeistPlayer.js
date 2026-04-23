import Player from '../essentials/Player.js';
import { getCellSize, collidesWithWalls, clamp, gridCenterToPixel } from './HeistUtils.js';

export default class HeistPlayer extends Player {
  constructor(data = {}, gameEnv) {
    super(data, gameEnv);
    this.color = data.color || '#09e6b7';
    this.startGrid = data.startGrid || { x: 1, y: 7 };
    this.canvas.style.zIndex = String(data.zIndex || 20);
    this.resetToStart();
  }

  resetToStart() {
    const center = gridCenterToPixel(this.gameEnv, this.startGrid.x, this.startGrid.y);
    this.position.x = center.x - this.width / 2;
    this.position.y = center.y - this.height / 2;
    this.velocity = { x: 0, y: 0 };
    this.pressedKeys = {};
    this.startPosition = { x: this.position.x, y: this.position.y };
  }

  resize() {
    const center = { x: this.position.x + this.width / 2, y: this.position.y + this.height / 2 };
    super.resize();
    const cellSize = getCellSize(this.gameEnv);
    this.width = Math.max(18, Math.round(cellSize.width * 0.7));
    this.height = Math.max(18, Math.round(cellSize.height * 0.7));
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.position.x = center.x - this.width / 2;
    this.position.y = center.y - this.height / 2;
  }

  move() {
    if (this.gameEnv.gameControl && this.gameEnv.gameControl.isPaused) return;

    const nextX = this.position.x + this.velocity.x;
    const nextY = this.position.y + this.velocity.y;
    const width = this.width;
    const height = this.height;

    if (!collidesWithWalls(this.gameEnv, nextX, this.position.y, width, height)) {
      this.position.x = nextX;
    } else {
      this.velocity.x = 0;
    }

    if (!collidesWithWalls(this.gameEnv, this.position.x, nextY, width, height)) {
      this.position.y = nextY;
    } else {
      this.velocity.y = 0;
    }

    this.position.x = clamp(this.position.x, 0, this.gameEnv.innerWidth - width);
    this.position.y = clamp(this.position.y, 0, this.gameEnv.innerHeight - height);
  }

  draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const radius = Math.min(this.canvas.width, this.canvas.height) / 2 - 2;
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#1fffe0';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.setupCanvas();
  }
}
