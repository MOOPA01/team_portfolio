// =============================================================
// H.E.I.S.T.EXE Level 1: THE LOBBY (Rookie)
// Follows GameLevelDesert.js pattern
// =============================================================

import Player from './essentials/Player.js';
import Npc from './essentials/Npc.js';
import DialogueSystem from './essentials/DialogueSystem.js';
import Coin from './Coin.js';

const CELL = 32, COLS = 22, ROWS = 16;

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
    let width = gameEnv.innerWidth;
    let height = gameEnv.innerHeight;
    let path = gameEnv.path;

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

    // Player data
    const sprite_data_player = {
      id: 'ghost',
      greeting: 'You are GHOST, the elite infiltrator.',
      src: null, // No sprite, just render as circle
      SCALE_FACTOR: 1,
      ANIMATION_RATE: 1,
      INIT_POSITION: { x: 1 * CELL / 704, y: 7 * CELL / 512 },
      pixels: { height: 512, width: 704 },
      down: { row: 0, start: 0, columns: 1 },
      hitbox: { widthPercentage: 0, heightPercentage: 0 },
      keypress: { up: 87, left: 65, down: 83, right: 68 }, // WASD
      isHeistPlayer: true,
      heistData: {
        x: 1 * CELL + CELL / 2,
        y: 7 * CELL + CELL / 2,
        r: 9,
        speed: 3.2
      }
    };

    // NPC data for Level 1
    const sprite_data_npc = {
      id: 'Protocol AI',
      greeting: 'Protocol active. State your concerns, operative.',
      src: null,
      SCALE_FACTOR: 1,
      ANIMATION_RATE: 1,
      INIT_POSITION: { x: 10.5 * CELL / 704, y: 10.5 * CELL / 512 },
      pixels: { height: 512, width: 704 },
      down: { row: 0, start: 0, columns: 1 },
      hitbox: { widthPercentage: 0, heightPercentage: 0 },
      isHeistNPC: true,
      heistData: {
        x: 10.5 * CELL,
        y: 10.5 * CELL,
        r: 8,
        color: '#ffdd00'
      },
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
          this.dialogueSystem.showDialogue(
            this.dialogues[Math.floor(Math.random() * this.dialogues.length)],
            'Protocol AI',
            null
          );
        }
      }
    };

    // Gems (using Coin as base)
    const gems = [
      { x: 4, y: 2 }, { x: 8, y: 2 }, { x: 12, y: 2 }, { x: 16, y: 2 },
      { x: 2, y: 6 }, { x: 7, y: 6 }, { x: 11, y: 6 },
      { x: 4, y: 11 }, { x: 8, y: 12 }, { x: 13, y: 13 }, { x: 17, y: 11 },
      { x: 20, y: 2 }, { x: 20, y: 13 },
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

    // Goal zone
    gameEnv.heistGoal = {
      x: 19 * CELL,
      y: 6 * CELL,
      w: 2 * CELL,
      h: 3 * CELL
    };

    gameEnv.heistTotalGems = gems.length;
    gameEnv.heistGuards = []; // Level 1 has no guards

    this.classes = [
      { class: Player, data: sprite_data_player },
      { class: Npc, data: sprite_data_npc },
      ...gemData.map(g => ({ class: Coin, data: g }))
    ];
  }
}

export default HeistLevel1;
