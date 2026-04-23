import Coin from '../Coin.js';
import { getCellSize } from './HeistUtils.js';

export default class HeistGem extends Coin {
  constructor(data = {}, gameEnv) {
    super(data, gameEnv);
    this.color = data.color || '#00d2ff';
    this.zIndex = data.zIndex || 15;
    this.canvas.style.zIndex = String(this.zIndex);
  }

  resize() {
    const center = { x: this.position.x + this.width / 2, y: this.position.y + this.height / 2 };
    const cellSize = getCellSize(this.gameEnv);
    this.width = Math.max(16, Math.round(cellSize.width * 0.45));
    this.height = Math.max(16, Math.round(cellSize.height * 0.45));
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.position.x = center.x - this.width / 2;
    this.position.y = center.y - this.height / 2;
  }

  draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const w = this.canvas.width;
    const h = this.canvas.height;
    const midX = w / 2;
    const midY = h / 2;
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.moveTo(midX, 2);
    this.ctx.lineTo(w - 2, midY);
    this.ctx.lineTo(midX, h - 2);
    this.ctx.lineTo(2, midY);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
    this.setupCanvas();
  }
}
