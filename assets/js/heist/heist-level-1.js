// =============================================================
//  H.E.I.S.T.EXE  —  heist-level-1.js
//  Sector: THE LOBBY  |  Difficulty: ROOKIE
// =============================================================

import { registerLevel, buildBorderWalls, rectWall, COLS, ROWS }
  from './heist-core.js';

registerLevel({
  walls: buildBorderWalls(COLS, ROWS).concat([
    ...rectWall(2,  4, 6, 1), ...rectWall(10, 4, 5, 1),
    ...rectWall(2,  9, 4, 1), ...rectWall(8,  9, 5, 1),
    ...rectWall(15, 6, 1, 5), ...rectWall(5,  7, 2, 1),
    ...rectWall(12,11, 3, 1), ...rectWall(18, 3, 2, 3),
    ...rectWall(18, 9, 2, 3),
  ]),
  start: { x: 1, y: 7 },
  goal:  { x: 19, y: 6, w: 2, h: 3 },
  gems: [
    { x: 4,  y: 2 }, { x: 8,  y: 2 }, { x: 12, y: 2 }, { x: 16, y: 2 },
    { x: 2,  y: 6 }, { x: 7,  y: 6 }, { x: 11, y: 6 },
    { x: 4,  y: 11 }, { x: 8, y: 12 }, { x: 13, y: 13 }, { x: 17, y: 11 },
    { x: 20, y: 2 }, { x: 20, y: 13 },
  ],
  guards: []
});

export const INTRO_SCENES = [
  { label:'// GHOST PROTOCOL — MISSION INIT',
    text:'Booting <span class="highlight">H.E.I.S.T.EXE</span>...\nHigh-Efficiency Infiltration & Stealth Toolkit\n\nAgent status: <span class="success">ACTIVE</span>\nTarget facility: AEGIS FINANCIAL TOWER\nMission classification: <span class="danger">BLACK OPS</span>' },
  { label:'// OPERATIVE DOSSIER',
    text:'You are <span class="highlight">GHOST</span> — the most elusive thief in the world.\n\nYour specialty: penetrating impossible security,\nvanishing without a trace, and walking out\nwith everything they said couldn\'t be stolen.\n\nYou\'ve cracked 14 vaults across 9 countries.\n<span class="highlight">No one has ever seen your face.</span>' },
  { label:'// INTELLIGENCE BRIEFING',
    text:'<span class="danger">SITUATION CRITICAL.</span>\n\nAEGIS Corporation has seized assets belonging\nto dozens of whistleblowers — evidence locked\nbehind their vault network.\n\nFour floors. Four vaults. All interconnected.\n<span class="highlight">You have 90 minutes before the system reboots.</span>' },
  { label:'// TARGET: THE GEMS',
    text:'Each floor contains encrypted <span class="highlight">data gems</span> —\nstolen evidence encoded into quantum crystals.\n\nCollect every gem. Reach the extraction point.\nDo not get caught.\n\nGuards on upper floors patrol with <span class="danger">lethal protocols.</span>\nOne touch. You\'re done.' },
  { label:'// DEPLOYING TO FLOOR 1',
    text:'Floor 1: THE LOBBY\nSecurity level: <span class="success">MINIMAL</span>\nGuards on duty: <span class="success">NONE</span>\n\nConsider this your warm-up, Ghost.\nCollect the gems. Find the exit.\n\n<span class="highlight">The vault awaits. Move silently.</span>' },
];
