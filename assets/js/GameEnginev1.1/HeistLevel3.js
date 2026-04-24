// =============================================================
// H.E.I.S.T.EXE Level 3: VAULT ANTECHAMBER (Specialist)
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

class HeistLevel3 {
  constructor(gameEnv) {
    // CRITICAL: Set dimensions that HeistUtils and custom heist classes rely on
    gameEnv.innerWidth = gameEnv.gameCanvas?.clientWidth || 704;
    gameEnv.innerHeight = gameEnv.gameCanvas?.clientHeight || 512;

    const walls = buildBorderWalls(COLS, ROWS).concat([
      ...rectWall(3, 3, 4, 2), ...rectWall(10, 2, 4, 3),
      ...rectWall(16, 4, 3, 2), ...rectWall(4, 8, 6, 1),
      ...rectWall(14, 10, 5, 1), ...rectWall(8, 13, 8, 1),
    ]);
    gameEnv.heistWalls = buildWallSet(walls);
    gameEnv.heistLevel = 3;
    gameEnv.heistLevelName = 'VAULT ANTECHAMBER';

    const sprite_data_player = {
      id: 'ghost',
      greeting: 'Level 3: Maximum security protocols.',
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
      { x: 5, y: 1 }, { x: 12, y: 1 }, { x: 18, y: 2 },
      { x: 2, y: 7 }, { x: 11, y: 6 }, { x: 20, y: 7 },
      { x: 6, y: 11 }, { x: 13, y: 13 }, { x: 18, y: 11 },
      { x: 9, y: 4 }, { x: 15, y: 9 }, { x: 3, y: 13 }
    ];

    const gemData = gems.map(g => ({
      id: `gem-${g.x}-${g.y}`,
      INIT_POSITION: { x: g.x * CELL / 704, y: g.y * CELL / 512 },
      width: 12,
      height: 12,
      color: '#00c8ff',
      value: 1,
      isHeistGem: true,
      heistData: {
        x: g.x * CELL + CELL / 2,
        y: g.y * CELL + CELL / 2,
        r: 6,
        color: '#00c8ff'
      }
    }));

    gameEnv.heistGoal = {
      x: 20 * CELL,
      y: 13 * CELL,
      w: 1 * CELL,
      h: 1 * CELL
    };

    gameEnv.heistTotalGems = gems.length;
    gameEnv.heistGuards = [
      { x: 5*CELL+CELL/2, y: 6*CELL+CELL/2, vx: 3.39, vy: 0, r: 10, gridStart: { x: 5, y: 6 } },
      { x: 12*CELL+CELL/2, y: 5*CELL+CELL/2, vx: 0, vy: 3.39, r: 10, gridStart: { x: 12, y: 5 } },
      { x: 17*CELL+CELL/2, y: 8*CELL+CELL/2, vx: 4.8, vy: 0, r: 10, gridStart: { x: 17, y: 8 } },
      { x: 9*CELL+CELL/2, y: 10*CELL+CELL/2, vx: 0, vy: -4.8, r: 10, gridStart: { x: 9, y: 10 } },
      { x: 2*CELL+CELL/2, y: 12*CELL+CELL/2, vx: 4.8, vy: 0, r: 10, gridStart: { x: 2, y: 12 } },
      { x: 20*CELL+CELL/2, y: 4*CELL+CELL/2, vx: -4.8, vy: 0, r: 10, gridStart: { x: 20, y: 4 } }
    ];

    this.classes = [
      { class: HeistBackground, data: { zIndex: 0 } },
      { class: HeistGoal, data: { goalGrid: { x: 20, y: 13, w: 1, h: 1 }, zIndex: 5 } },
      { class: HeistPlayer, data: { startGrid: { x: 1, y: 1 }, color: '#62e0ff', zIndex: 20 } },
      ...gemData.map(g => ({ class: HeistGem, data: { ...g, zIndex: 15 } })),
      ...gameEnv.heistGuards.map(guard => ({ class: HeistGuard, data: { ...guard, color: '#ff6b6b', zIndex: 15 } }))
    ];
  }
}

export default HeistLevel3;
