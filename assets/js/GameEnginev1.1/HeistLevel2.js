// =============================================================
// H.E.I.S.T.EXE Level 2: SECURITY HUB (Operative)
// Uses standard GameEngine Player, Npc, and Coin classes
// =============================================================

import Player from './essentials/Player.js';
import Npc from './essentials/Npc.js';
import Coin from './Coin.js';
import HeistBackground from './heist/HeistBackground.js';
import HeistGoal from './heist/HeistGoal.js';
import HeistPlayer from './heist/HeistPlayer.js';
import HeistGem from './heist/HeistGem.js';
import HeistGuard from './heist/HeistGuard.js';
import { COLS, ROWS } from './heist/HeistUtils.js';

const CELL = 32;

function buildBorderWalls(cols, rows) {
  const w = [];
  for (let x = 0; x < cols; x++) {
    w.push({ x, y: 0 });
    w.push({ x, y: rows - 1 });
  }
  for (let y = 1; y < rows - 1; y++) {
    w.push({ x: 0, y });
    w.push({ x: cols - 1, y });
  }
  return w;
}

function rectWall(x, y, w, h) {
  const cells = [];
  for (let row = y; row < y + h; row++)
    for (let col = x; col < x + w; col++)
      cells.push({ x: col, y: row });
  return cells;
}

function buildWallSet(walls) {
  return new Set(walls.map(w => `${w.x},${w.y}`));
}

class HeistLevel2 {
  constructor(gameEnv) {
    // CRITICAL: Set dimensions that HeistUtils and custom heist classes rely on
    gameEnv.innerWidth = gameEnv.gameCanvas?.clientWidth || 704;
    gameEnv.innerHeight = gameEnv.gameCanvas?.clientHeight || 512;

    const walls = buildBorderWalls(COLS, ROWS).concat([
      ...rectWall(2, 5, 7, 1), ...rectWall(11, 5, 9, 1),
      ...rectWall(2, 11, 9, 1), ...rectWall(16, 11, 4, 1),
      ...rectWall(10, 1, 1, 4), ...rectWall(10, 12, 1, 3),
      ...rectWall(5, 8, 2, 1), ...rectWall(15, 8, 2, 1),
    ]);
    gameEnv.heistWalls = buildWallSet(walls);
    gameEnv.heistLevel = 2;
    gameEnv.heistLevelName = 'SECURITY HUB';

    const sprite_data_player = {
      id: 'ghost',
      greeting: 'Level 2: Security protocols engaged.',
      src: null,
      SCALE_FACTOR: 1,
      ANIMATION_RATE: 1,
      INIT_POSITION: { x: 1 * CELL / 704, y: 1 * CELL / 512 },
      pixels: { height: 256, width: 256 },
      down: { row: 0, start: 0, columns: 1 },
      hitbox: { widthPercentage: 0, heightPercentage: 0 },
      keypress: { up: 87, left: 65, down: 83, right: 68 },
      isHeistPlayer: true,
      heistData: {
        x: 1 * CELL + CELL / 2,
        y: 1 * CELL + CELL / 2,
        r: 9,
        speed: 3.2
      }
    };

    const gems = [
      { x: 4, y: 3, color: '#00c8ff' }, { x: 8, y: 3, color: '#ff00cc' },
      { x: 13, y: 3, color: '#00c8ff' }, { x: 17, y: 3, color: '#ff00cc' },
      { x: 8, y: 13, color: '#00c8ff' }, { x: 13, y: 11, color: '#ff00cc' },
      { x: 2, y: 8, color: '#ff00cc' }, { x: 20, y: 8, color: '#00c8ff' },
      { x: 11, y: 8, color: '#ff00cc' },
    ];

    const gemData = gems.map(g => ({
      id: `gem-${g.x}-${g.y}`,
      INIT_POSITION: { x: g.x * CELL / 704, y: g.y * CELL / 512 },
      width: 12,
      height: 12,
      color: g.color,
      value: 1,
      isHeistGem: true,
      heistData: {
        x: g.x * CELL + CELL / 2,
        y: g.y * CELL + CELL / 2,
        r: 6,
        color: g.color
      }
    }));

    gameEnv.heistGoal = {
      x: 19 * CELL,
      y: 7 * CELL,
      w: 2 * CELL,
      h: 2 * CELL
    };

    gameEnv.heistTotalGems = gems.length;
    gameEnv.heistGuards = [
      { x: 4*CELL+CELL/2, y: 3*CELL+CELL/2, vx: 4.8, vy: 0, r: 10, gridStart: { x: 4, y: 3 } },
      { x: 17*CELL+CELL/2, y: 3*CELL+CELL/2, vx: -4.8, vy: 0, r: 10, gridStart: { x: 17, y: 3 } },
      { x: 4*CELL+CELL/2, y: 13*CELL+CELL/2, vx: 0, vy: -4.8, r: 10, gridStart: { x: 4, y: 13 } },
      { x: 17*CELL+CELL/2, y: 13*CELL+CELL/2, vx: 0, vy: 4.8, r: 10, gridStart: { x: 17, y: 13 } },
      { x: 12*CELL+CELL/2, y: 11*CELL+CELL/2, vx: 4.8, vy: 0, r: 10, gridStart: { x: 12, y: 11 } },
      { x: 11*CELL+CELL/2, y: 8*CELL+CELL/2, vx: 4.8, vy: 0, r: 10, gridStart: { x: 11, y: 8 } },
    ];

    this.classes = [
      { class: HeistBackground, data: { zIndex: 0 } },
      { class: HeistGoal, data: { goalGrid: { x: 19, y: 7, w: 2, h: 2 }, zIndex: 5 } },
      { class: HeistPlayer, data: { startGrid: { x: 1, y: 1 }, color: '#44d8ff', zIndex: 20 } },
      ...gemData.map(g => ({ class: HeistGem, data: { ...g, zIndex: 15 } })),
      ...gameEnv.heistGuards.map(guard => ({ class: HeistGuard, data: { ...guard, color: '#ff2a2a', zIndex: 15 } }))
    ];
  }
}

export default HeistLevel2;
