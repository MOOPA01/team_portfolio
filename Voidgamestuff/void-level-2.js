// =============================================================
//  V.O.I.D.EXE  —  void-level-2.js
//  Place at: assets/js/void-level-2.js
//
//  Contains:
//    · Level 2 map data (Two Pillars)
//
//  Requires void-core.js to be loaded first.
// =============================================================

// ── LEVEL 2 — TWO PILLARS ────────────────────────────────────
// Two tall wall pillars divide the grid into three lanes.
// Enemies patrol all three lanes — first real threat encounter.

LEVELS.push({
  walls: buildBorderWalls(COLS, ROWS).concat([
    ...rectWall(5,  2, 2, 12),
    ...rectWall(15, 2, 2, 12),
  ]),

  start: { x: 2, y: 7 },
  goal:  { x: 18, y: 5, w: 3, h: 6 },

  coins: [
    { x: 8,  y: 3  }, { x: 11, y: 3  }, { x: 13, y: 3  },
    { x: 8,  y: 12 }, { x: 11, y: 12 }, { x: 13, y: 12 },
    { x: 10, y: 7  },
  ],

  enemies: [
    { x: 2*CELL+CELL/2,  y: 3*CELL+CELL/2,  vx: 0,    vy: 4.8  },
    { x: 2*CELL+CELL/2,  y: 11*CELL+CELL/2, vx: 0,    vy: -4.8 },
    { x: 8*CELL+CELL/2,  y: 7*CELL+CELL/2,  vx: 4.8,  vy: 0    },
    { x: 13*CELL+CELL/2, y: 11*CELL+CELL/2, vx: -4.8, vy: 0    },
    { x: 19*CELL+CELL/2, y: 5*CELL+CELL/2,  vx: 0,    vy: 4.8  },
  ]
});
