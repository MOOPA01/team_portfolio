// =============================================================
// H.E.I.S.T.EXE Level 4: THE VAULT CORE (Elite)
// Follows GameLevelDesert.js pattern
// =============================================================

import HeistBackground from './heist/HeistBackground.js';
import HeistPlayer from './heist/HeistPlayer.js';
import HeistGem from './heist/HeistGem.js';
import HeistGuard from './heist/HeistGuard.js';
import HeistGoal from './heist/HeistGoal.js';

const CELL = 32, COLS = 22, ROWS = 16;

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

class HeistLevel4 {
  constructor(gameEnv) {
    let width = gameEnv.innerWidth;
    let height = gameEnv.innerHeight;
    let path = gameEnv.path;

    const walls = buildBorderWalls(COLS, ROWS).concat([
      ...rectWall(3, 2, 5, 3), ...rectWall(11, 4, 4, 2),
      ...rectWall(18, 1, 2, 5), ...rectWall(5, 9, 6, 2),
      ...rectWall(14, 11, 5, 2), ...rectWall(2, 14, 8, 1),
    ]);
    gameEnv.heistWalls = buildWallSet(walls);
    gameEnv.heistLevel = 4;
    gameEnv.heistLevelName = 'THE VAULT CORE';

    const sprite_data_player = {
      id: 'ghost',
      greeting: 'Level 4: You have entered the inner sanctum.',
      src: null,
      SCALE_FACTOR: 1,
      ANIMATION_RATE: 1,
      INIT_POSITION: { x: 1 * CELL / 704, y: 1 * CELL / 512 },
      pixels: { height: 512, width: 704 },
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
      { x: 2, y: 2 }, { x: 7, y: 2 }, { x: 13, y: 1 }, { x: 17, y: 7 },
      { x: 4, y: 11 }, { x: 10, y: 12 }, { x: 19, y: 12 },
      { x: 2, y: 15 }, { x: 20, y: 15 }, { x: 11, y: 8 }
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
      y: 1 * CELL,
      w: 1 * CELL,
      h: 2 * CELL
    };

    gameEnv.heistTotalGems = gems.length;
    gameEnv.heistGuards = [
      { x: 7*CELL+CELL/2, y: 7*CELL+CELL/2, vx: 4.8, vy: 4.8, r: 10, gridStart: { x: 7, y: 7 } },
      { x: 14*CELL+CELL/2, y: 3*CELL+CELL/2, vx: -4.8, vy: 4.8, r: 10, gridStart: { x: 14, y: 3 } },
      { x: 2*CELL+CELL/2, y: 10*CELL+CELL/2, vx: 4.8, vy: -4.8, r: 10, gridStart: { x: 2, y: 10 } },
      { x: 19*CELL+CELL/2, y: 10*CELL+CELL/2, vx: -4.8, vy: -4.8, r: 10, gridStart: { x: 19, y: 10 } },
      { x: 11*CELL+CELL/2, y: 5*CELL+CELL/2, vx: 4.8, vy: 0, r: 10, gridStart: { x: 11, y: 5 } },
      { x: 9*CELL+CELL/2, y: 13*CELL+CELL/2, vx: -4.8, vy: 0, r: 10, gridStart: { x: 9, y: 13 } },
      { x: 16*CELL+CELL/2, y: 6*CELL+CELL/2, vx: 0, vy: 4.8, r: 10, gridStart: { x: 16, y: 6 } },
      { x: 5*CELL+CELL/2, y: 14*CELL+CELL/2, vx: 0, vy: -4.8, r: 10, gridStart: { x: 5, y: 14 } },
    ];

    this.classes = [
      { class: HeistBackground, data: { zIndex: 0 } },
      { class: HeistGoal, data: { goalGrid: { x: 20, y: 1, w: 1, h: 2 }, zIndex: 5 } },
      { class: HeistPlayer, data: { startGrid: { x: 1, y: 1 }, color: '#66e6ff', zIndex: 20 } },
      ...gemData.map(g => ({ class: HeistGem, data: { ...g, zIndex: 15 } })),
      ...gameEnv.heistGuards.map(guard => ({ class: HeistGuard, data: { ...guard, color: '#ff6d40', zIndex: 15 } }))
    ];
  }
}

export default HeistLevel4;
