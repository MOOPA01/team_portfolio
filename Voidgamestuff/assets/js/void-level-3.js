// =============================================================
//  V.O.I.D.EXE  —  void-level-3.js
//  Place at: assets/js/void-level-3.js
//
//  Contains:
//    · Level 3 map data (Nested Rings)
//
//  Requires void-core.js to be loaded first.
// =============================================================

// ── LEVEL 3 — NESTED RINGS ───────────────────────────────────
// Layout:
//   OUTER ring  (cols 2–19, rows 2–13) — gap LEFT  rows 7–8
//   MIDDLE ring (cols 5–16, rows 4–11) — gap RIGHT rows 7–8
//   INNER ring  (cols 7–14, rows 6–9)  — gap LEFT  rows 7–8
//   Goal: cols 9–12, rows 7–8 (dead centre)
//
// Enemies (5 total — removed the outer-top horizontal patroller
//   that spawned adjacent to the col-3 row-3 coin and blocked it):
//   · 2 vertical patrollers in outer right zone (cols 10, 17)
//   · 1 vertical patroller col 4, outer LEFT zone
//   · 1 vertical patroller col 6, middle zone
//   · 1 horizontal patroller inside inner ring

LEVELS.push({
  walls: buildBorderWalls(COLS, ROWS).concat([
    // Outer ring
    ...rectWall(2,  2,  18, 1), ...rectWall(2,  13, 18, 1),
    ...rectWall(2,  3,  1,  4), ...rectWall(2,  9,  1,  4),
    ...rectWall(19, 3,  1,  10),
    // Middle ring
    ...rectWall(5,  4,  12, 1), ...rectWall(5,  11, 12, 1),
    ...rectWall(5,  5,  1,  6),
    ...rectWall(16, 5,  1,  2), ...rectWall(16, 9,  1,  2),
    // Inner ring
    ...rectWall(7,  6,  8,  1), ...rectWall(7,  9,  8,  1),
    ...rectWall(14, 7,  1,  2),
  ]),

  start: { x: 1, y: 7 },
  goal:  { x: 9, y: 7, w: 4, h: 2 },

  coins: [
    { x: 3,  y: 3  }, { x: 12, y: 3  }, { x: 18, y: 3  },
    { x: 3,  y: 12 }, { x: 12, y: 12 }, { x: 18, y: 12 },
    { x: 8,  y: 5  }, { x: 12, y: 5  }, { x: 15, y: 5  },
    { x: 8,  y: 10 }, { x: 12, y: 10 }, { x: 15, y: 10 },
  ],

  enemies: [
    { x: 10*CELL+CELL/2, y: 3*CELL+CELL/2,  vx: 0,   vy: 4.8  },  // outer right ↓
    { x: 17*CELL+CELL/2, y: 11*CELL+CELL/2, vx: 0,   vy: -4.8 },  // outer right ↑
    { x: 4*CELL+CELL/2,  y: 3*CELL+CELL/2,  vx: 4.8, vy: 0    },  // outer top →
    { x: 4*CELL+CELL/2,  y: 9*CELL+CELL/2,  vx: 0,   vy: 4.8  },  // outer LEFT col4 ↓
    { x: 8*CELL+CELL/2,  y: 7*CELL+CELL/2,  vx: 4.8, vy: 0    },  // inner ring →
  ]
});

export default level3;