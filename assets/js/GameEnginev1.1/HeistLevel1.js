// =============================================================
// H.E.I.S.T.EXE Level 1: THE LOBBY (Rookie)
// Uses standard GameEngine Player, Npc, and Coin classes
// =============================================================

import Player from './essentials/Player.js';
import Npc from './essentials/Npc.js';
import Coin from './Coin.js';
import HeistBackground from './heist/HeistBackground.js';
import HeistGoal from './heist/HeistGoal.js';
import { COLS, ROWS } from './heist/HeistUtils.js';

const CELL = 32;

// Wall utility functions
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

class HeistLevel1 {
  constructor(gameEnv) {
    // CRITICAL: Set dimensions that HeistUtils and custom heist classes rely on
    gameEnv.innerWidth = gameEnv.gameCanvas?.clientWidth || 704;
    gameEnv.innerHeight = gameEnv.gameCanvas?.clientHeight || 512;

    // Store walls for collision detection
    const walls = buildBorderWalls(COLS, ROWS).concat([
      ...rectWall(2, 4, 6, 1), ...rectWall(10, 4, 5, 1),
      ...rectWall(2, 9, 4, 1), ...rectWall(8, 9, 5, 1),
      ...rectWall(15, 6, 1, 5), ...rectWall(5, 7, 2, 1),
      ...rectWall(12, 11, 3, 1), ...rectWall(18, 3, 2, 3),
      ...rectWall(18, 9, 2, 3),
    ]);
    gameEnv.heistWalls = buildWallSet(walls);
    gameEnv.heistLevel = 1;
    gameEnv.heistLevelName = 'THE LOBBY';

    // Player data (GHOST)
    const sprite_src_ghost = gameEnv.path + "/images/heist_mc.png";
    const sprite_data_ghost = {
      id: 'ghost',
      greeting: 'You are GHOST, the elite infiltrator.',
      src: sprite_src_ghost,
      SCALE_FACTOR: 4,
      STEP_FACTOR: 1000,
      ANIMATION_RATE: 50,
      pixels: { height: 256, width: 256 },
      INIT_POSITION: { x: 1 / COLS, y: 7 / ROWS },
      /*
      orientation: { rows: 3, columns: 4 },
      down: { row: 0, start: 0, columns: 3 },
      downRight: { row: 1, start: 0, columns: 3, rotate: Math.PI / 16 },
      downLeft: { row: 2, start: 0, columns: 3, rotate: -Math.PI / 16 },
      left: { row: 2, start: 0, columns: 3 },
      right: { row: 1, start: 0, columns: 3 },
      up: { row: 3, start: 0, columns: 3 },
      upLeft: { row: 2, start: 0, columns: 3, rotate: Math.PI / 16 },
      upRight: { row: 1, start: 0, columns: 3, rotate: -Math.PI / 16 },
      */
      hitbox: { widthPercentage: 0.45, heightPercentage: 0.4 },
      keypress: { up: 87, left: 65, down: 83, right: 68 } // W, A, S, D
    };

    // NPC data (Protocol AI)
    const sprite_src_npc = gameEnv.path + "/images/heist_npc.png";
    const sprite_greet_npc = "Protocol active. State your concerns, operative.";
    const sprite_data_npc = {
      id: 'Protocol AI',
      greeting: sprite_greet_npc,
      src: sprite_src_npc,
      SCALE_FACTOR: 4,
      ANIMATION_RATE: 50,
      pixels: { height: 256, width: 256 },
        INIT_POSITION: { x: 10 / COLS, y: 10 / ROWS },
      //orientation: { rows: 3, columns: 4 },
      //down: { row: 0, start: 0, columns: 3 },
      hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },
      dialogues: [
        "Collect all data packages before extraction.",
        "Guards patrol in predictable patterns. Study their routes.",
        "Stay in shadows when possible. Avoid direct confrontation.",
        "The extraction point activates once all packages are secured.",
        "Watch the guard movements—timing is everything."
      ],
      reaction: function() {
        if (this.dialogueSystem) {
          this.showReactionDialogue();
        }
      },
      interact: function() {
        if (this.dialogueSystem) {
          this.showRandomDialogue();
        }
      }
    };

    // Gem positions for Level 1 (13 total)
    const gem_positions = [
      { x: 4, y: 2 }, { x: 8, y: 2 }, { x: 12, y: 2 }, { x: 16, y: 2 },
      { x: 2, y: 6 }, { x: 7, y: 6 }, { x: 11, y: 6 },
      { x: 4, y: 11 }, { x: 8, y: 12 }, { x: 13, y: 13 }, { x: 17, y: 11 },
      { x: 20, y: 2 }, { x: 20, y: 13 },
    ];

    const gemsData = gem_positions.map(pos => ({
      id: `gem-${pos.x}-${pos.y}`,
      INIT_POSITION: { x: pos.x / COLS, y: pos.y / ROWS },
      width: 12,
      height: 12,
      color: '#00c8ff',
      hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
      zIndex: 12,
      value: 1
    }));

    // Store game metadata
    gameEnv.heistTotalGems = gem_positions.length;
    gameEnv.heistGuards = []; // Level 1 has no guards

    // Goal zone data
    const goal_data = {
      id: 'extraction-point',
      goalGrid: { x: 19, y: 6, w: 2, h: 3 }
    };
    gameEnv.heistGoal = goal_data.goalGrid;

    // Background data
    const background_data = {
      id: 'background',
      name: 'lobby'
    };

    this.classes = [
      { class: HeistBackground, data: background_data },
      { class: HeistGoal, data: goal_data },
      { class: Player, data: sprite_data_ghost },
      { class: Npc, data: sprite_data_npc },
      ...gemsData.map(g => ({ class: Coin, data: g }))
    ];
  }
}

export default HeistLevel1;
