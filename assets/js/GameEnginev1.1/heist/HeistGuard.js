import Character from '../essentials/Character.js';
import Player from '../essentials/Player.js';
import { getCellSize, collidesWithWalls, clamp, gridCenterToPixel } from './HeistUtils.js';

export default class HeistGuard extends Character {
  constructor(data = {}, gameEnv) {
    super(data, gameEnv);
    this.color = data.color || '#ff4b4b';
    this.velocity = { x: data.vx || 0, y: data.vy || 0 };
    this.canvas.style.zIndex = String(data.zIndex || 15);
    this.gridStart = data.gridStart || null;
    if (this.gridStart) {
      const center = gridCenterToPixel(gameEnv, this.gridStart.x, this.gridStart.y);
      this.position.x = center.x - this.width / 2;
      this.position.y = center.y - this.height / 2;
    }
  }

  resize() {
    const center = { x: this.position.x + this.width / 2, y: this.position.y + this.height / 2 };
    const cellSize = getCellSize(this.gameEnv);
    this.width = Math.max(16, Math.round(cellSize.width * 0.7));
    this.height = Math.max(16, Math.round(cellSize.height * 0.7));
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.position.x = center.x - this.width / 2;
    this.position.y = center.y - this.height / 2;
  }

  update() {
    if (this.gameEnv.gameControl && this.gameEnv.gameControl.isPaused) {
      this.draw();
      return;
    }

    this.move();
    this.draw();
    this.checkPlayerCollision();
  }

  move() {
    const nextX = this.position.x + this.velocity.x;
    const nextY = this.position.y + this.velocity.y;
    const width = this.width;
    const height = this.height;

    const hitX = collidesWithWalls(this.gameEnv, nextX, this.position.y, width, height);
    const hitY = collidesWithWalls(this.gameEnv, this.position.x, nextY, width, height);

    if (hitX) {
      this.velocity.x = -this.velocity.x;
    } else {
      this.position.x = nextX;
    }

    if (hitY) {
      this.velocity.y = -this.velocity.y;
    } else {
      this.position.y = nextY;
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
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
    this.ctx.fillStyle = '#fff';
    const eyeRadius = Math.max(2, radius * 0.2);
    this.ctx.beginPath();
    this.ctx.arc(this.canvas.width * 0.35, this.canvas.height * 0.35, eyeRadius, 0, Math.PI * 2);
    this.ctx.arc(this.canvas.width * 0.65, this.canvas.height * 0.35, eyeRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.setupCanvas();
  }

  checkPlayerCollision() {
    const player = this.gameEnv.gameObjects.find(obj => obj instanceof Player);
    if (!player) return;

    this.isCollision(player);
    if (this.collisionData?.hit && Date.now() > (this.catchCooldown || 0)) {
      this.catchCooldown = Date.now() + 800;
      if (player.resetToStart) {
        player.resetToStart();
      }
      if (this.gameEnv.stats) {
        this.gameEnv.stats.coinsCollected = 0;
      }
      alert('The guard spotted you! Returning to start.');
    }
  }
}
