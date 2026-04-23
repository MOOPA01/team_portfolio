import Npc from '../essentials/Npc.js';
import { getCellSize } from './HeistUtils.js';

export default class HeistNpc extends Npc {
  constructor(data = {}, gameEnv) {
    super(data, gameEnv);
    this.color = data.color || '#f0c850';
    this.canvas.style.zIndex = String(data.zIndex || 12);
  }

  resize() {
    const center = { x: this.position.x + this.width / 2, y: this.position.y + this.height / 2 };
    const cellSize = getCellSize(this.gameEnv);
    this.width = Math.max(18, Math.round(cellSize.width * 0.65));
    this.height = Math.max(18, Math.round(cellSize.height * 0.65));
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.position.x = center.x - this.width / 2;
    this.position.y = center.y - this.height / 2;
  }

  draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const radius = Math.min(this.canvas.width, this.canvas.height) / 2 - 2;
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
    this.ctx.fillStyle = '#222';
    this.ctx.beginPath();
    this.ctx.arc(this.canvas.width * 0.35, this.canvas.height * 0.34, radius * 0.2, 0, Math.PI * 2);
    this.ctx.arc(this.canvas.width * 0.65, this.canvas.height * 0.34, radius * 0.2, 0, Math.PI * 2);
    this.ctx.fill();
    this.setupCanvas();
  }
}
