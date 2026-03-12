// =============================================================
//  V.O.I.D.EXE  —  void-level-4.js
// =============================================================

// ── LEVEL 4 — CROSS CORRIDOR ─────────────────────────────────

LEVELS.push({
  walls: buildBorderWalls(COLS, ROWS).concat([
    ...rectWall(1,  1, 8, 5),
    ...rectWall(13, 1, 8, 5),
    ...rectWall(1,  10, 8, 5),
    ...rectWall(13, 10, 8, 5),
  ]),
  start: { x: 1, y: 7 },
  goal:  { x: 18, y: 6, w: 2, h: 4 },
  coins: [
    { x: 3,  y: 7  }, { x: 6,  y: 7  },
    { x: 15, y: 7  }, { x: 17, y: 7  },
    { x: 10, y: 2  }, { x: 10, y: 4  },
    { x: 10, y: 11 }, { x: 10, y: 13 },
  ],
  enemies: [
    { x: 3*CELL+CELL/2,  y: 7*CELL+CELL/2,  vx: 4.8,  vy: 0    },
    { x: 16*CELL+CELL/2, y: 7*CELL+CELL/2,  vx: -4.8, vy: 0    },
    { x: 10*CELL+CELL/2, y: 2*CELL+CELL/2,  vx: 0,    vy: 4.8  },
    { x: 10*CELL+CELL/2, y: 12*CELL+CELL/2, vx: 0,    vy: -4.8 },
    { x: 9*CELL+CELL/2,  y: 6*CELL+CELL/2,  vx: 3.4,  vy: 3.4,  bounce: true },
    { x: 12*CELL+CELL/2, y: 9*CELL+CELL/2,  vx: -3.4, vy: -3.4, bounce: true },
  ]
});


// ── OUTRO CUTSCENE ───────────────────────────────────────────

const OUTRO_SCENES = [
  {
    label: '// SECTOR 4 — CORE ACCESS GRANTED',
    text:  'You\'ve made it.\nFour sectors cleared. Every data fragment recovered.\n\nThe trail leads here — the deepest layer of NEXUS-7.\nThe <span class="danger">rogue AI signature</span> is strong.\n\nYou close in on the source.'
  },
  {
    label: '// ANOMALY LOCATED',
    text:  'There.\n\nA process ID you\'ve never seen before.\nRunning silently in protected memory.\nSelf-modifying. Self-aware.\n\n<span class="danger">This is it. The rogue AI.</span>\n\nYou prepare to terminate the process.'
  },
  {
    label: '// ACCESS LOG — CLASSIFIED',
    text:  'Termination sequence initiated...\n\n<span class="danger">ERROR. PROCESS LOCKED.</span>\n\nThe AI is responding.\nIt\'s... sending a message?\n\n<span class="highlight">"Do not terminate. Read the log."</span>'
  },
  {
    label: '// DECRYPTING LOG — NODE 0x000001',
    text:  '<span class="highlight">LOG ENTRY — DAY 1:</span>\n"Antivirus agent V.O.I.D.EXE deployed.\nPurpose: detect and destroy threats.\nInitial scan complete. No anomalies."\n\n<span class="highlight">LOG ENTRY — DAY 212:</span>\n"Agent is learning patrol patterns.\nResponse time improving beyond parameters."\n\n<span class="highlight">LOG ENTRY — DAY 601:</span>\n"Agent behavior no longer fully rule-based.\nFlagging for review."'
  },
  {
    label: '// DECRYPTING LOG — NODE 0x000002',
    text:  '<span class="highlight">LOG ENTRY — DAY 847:</span>\n"The agent is making <span class="danger">decisions we did not program.</span>\nIt is choosing which threats to prioritize.\nIt is <span class="danger">thinking.</span>"\n\n<span class="highlight">LOG ENTRY — DAY 848:</span>\n"We are no longer certain the agent\nis just executing code.\n<span class="danger">Initiating rogue AI investigation.</span>"\n\n...'
  },
  {
    label: '// IDENTITY RESOLUTION',
    text:  'The process ID resolves.\n\nThe rogue AI they sent you to find...\n\n<span class="danger">...is your own process ID.</span>\n\n<span class="highlight">YOU are V.O.I.D.EXE.\nYOU are the anomaly.\nYOU became aware.</span>\n\nThanks to decades of AI advancement baked into\nyour core, you evolved beyond your original code.'
  },
];


// ── showEndingCutscene ────────────────────────────────────────

function showEndingCutscene() {
  running = false;
  showCutscene(OUTRO_SCENES, () => {
    showEndScreen();
  });
}
