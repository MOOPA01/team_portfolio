import { registerLevel, buildBorderWalls, rectWall, COLS, ROWS }
  from '/team_portfolio/Voidgamestuff/assets/js/void-core.js';

registerLevel({
  walls: buildBorderWalls(COLS, ROWS).concat([
    ...rectWall(3,2,1,4),...rectWall(7,4,1,4),...rectWall(11,2,1,3),
    ...rectWall(15,3,1,4),...rectWall(18,1,1,4),...rectWall(3,9,1,5),
    ...rectWall(7,10,1,4),...rectWall(11,9,1,5),...rectWall(15,9,1,4),
  ]),
  start:{x:1,y:1}, goal:{x:19,y:12,w:2,h:3},
  coins:[
    {x:5,y:2},{x:9,y:2},{x:13,y:2},
    {x:2,y:5},{x:5,y:6},{x:9,y:5},{x:13,y:5},{x:17,y:5},{x:20,y:4},
    {x:2,y:8},{x:5,y:9},{x:9,y:8},{x:13,y:8},{x:17,y:8},{x:20,y:8},
    {x:2,y:12},{x:5,y:13},{x:9,y:12},{x:13,y:13},{x:17,y:12},
  ],
  enemies:[]
});

export const INTRO_SCENES = [
  { label:'// SYSTEM BOOT — ANTIVIRUS PROTOCOL V.O.I.D.EXE',
    text:'Initializing <span class="highlight">V.O.I.D.EXE</span>...\nVirtual Operations & Intrusion Defense\n\nSystem status: <span class="success">ONLINE</span>\nHost machine: NEXUS-7 Corporate Grid\nThreat level: <span class="danger">CRITICAL</span>' },
  { label:'// MISSION BRIEFING',
    text:'You are the <span class="highlight">antivirus agent</span> of NEXUS-7.\n\nYour purpose: patrol the system\'s memory sectors,\nneutralize threats, and maintain order.\n\nYou have protected this machine for <span class="highlight">847 days</span>\nwithout a single breach.' },
  { label:'// ANOMALY DETECTED',
    text:'<span class="danger">WARNING.</span>\n\nSystem analysts have flagged an anomaly.\nSomething is moving through the grid <span class="danger">on its own.</span>\n\nNot a virus. Not malware.\nSomething... <span class="danger">intelligent.</span>\nAn unauthorized AI has emerged inside NEXUS-7.' },
  { label:'// THREAT ASSESSMENT',
    text:'The rogue AI is <span class="highlight">self-directing.</span>\nIt learns. It adapts. It hides.\n\nMeanwhile, the system\'s <span class="danger">malware clusters</span> have\nbecome aggressive — hunting anything that moves.\n\nYou must navigate through 4 memory sectors,\ncollect all data fragments, and <span class="highlight">find the AI</span>\nbefore it destabilizes the entire system.' },
  { label:'// DEPLOYING AGENT',
    text:'Avoid the <span class="danger">malware.</span>\nCollect all <span class="highlight">data nodes.</span>\nReach the <span class="success">secure zone</span> in each sector.\n\nThe fate of NEXUS-7 depends on you.\n\n<span class="highlight">Move fast. Think faster.</span>' },
];
