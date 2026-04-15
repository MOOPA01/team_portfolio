// =============================================================
//  H.E.I.S.T.EXE  —  heist-level-1.js
//  Sector: THE LOBBY  |  Difficulty: ROOKIE
// =============================================================

const _coreUrl = new URL('./heist-core.js', import.meta.url).href;
const { registerLevel, buildBorderWalls, rectWall, COLS, ROWS, CELL } = await import(_coreUrl);

const pythonURI    = () => window._pythonURI    || 'http://localhost:8085';
const fetchOptions = () => window._fetchOptions || { credentials:'include', headers:{'Content-Type':'application/json'} };

// ─── NPC CHAT PANEL (CIPHER) ─────────────────────────────────
const NPC = {
  gridX:10, gridY:7, r:9, color:'#ffaa00', label:'CIPHER',
  expertise:'heist intelligence', chatHistory:[],
  get x(){return this.gridX*CELL+CELL/2;},
  get y(){return this.gridY*CELL+CELL/2;},
  openChat() { if (document.getElementById('heist-npc-panel')) return; ChatPanel.create(this); },
  closeChat() { ChatPanel.destroy(); }
};

const ChatPanel = {
  create(npc) {
    if (!document.getElementById('heist-npc-styles')) {
      const style=document.createElement('style');
      style.id='heist-npc-styles';
      style.textContent=`
        #heist-npc-panel{position:fixed;bottom:32px;left:50%;transform:translateX(-50%);width:min(480px,92vw);background:#0c1220;border:1px solid #ffaa00;box-shadow:0 0 24px rgba(255,170,0,0.15);z-index:9800;font-family:'Share Tech Mono',monospace;color:#99b0cc;display:flex;flex-direction:column;border-radius:2px;}
        #heist-npc-header{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid #1e2d4a;font-family:'Orbitron',monospace;font-size:0.7rem;letter-spacing:0.2em;color:#ffaa00;}
        #heist-npc-close{background:none;border:none;color:#445577;cursor:pointer;font-size:1rem;font-family:monospace;}
        #heist-npc-close:hover{color:#ffaa00;}
        #heist-npc-response{min-height:64px;max-height:180px;overflow-y:auto;padding:12px 16px;font-size:0.85rem;line-height:1.7;color:#8899aa;white-space:pre-wrap;border-bottom:1px solid #131e30;}
        #heist-npc-input{width:100%;box-sizing:border-box;background:transparent;border:none;border-top:1px solid #131e30;color:#d0e0f0;font-family:'Share Tech Mono',monospace;font-size:0.85rem;padding:10px 16px;resize:none;outline:none;}
        #heist-npc-footer{display:flex;justify-content:space-between;align-items:center;padding:8px 16px;border-top:1px solid #131e30;font-size:0.65rem;color:#2a3a52;letter-spacing:0.1em;}
        #heist-npc-send{background:transparent;border:1px solid #1e3a2a;color:#88bb99;font-family:'Orbitron',monospace;font-size:0.65rem;letter-spacing:0.15em;padding:5px 14px;cursor:pointer;}
        #heist-npc-send:hover{border-color:#ffaa00;color:#ffaa00;}
      `;
      document.head.appendChild(style);
    }
    const panel=document.createElement('div'); panel.id='heist-npc-panel';
    const header=document.createElement('div'); header.id='heist-npc-header';
    header.innerHTML=`<span>// CIPHER — LOBBY INFORMANT</span>`;
    const closeBtn=document.createElement('button'); closeBtn.id='heist-npc-close';
    closeBtn.textContent='✕'; closeBtn.onclick=()=>ChatPanel.destroy();
    header.appendChild(closeBtn);
    const response=document.createElement('div'); response.id='heist-npc-response';
    response.textContent='CIPHER: Need intel? Ask me anything.';
    const input=document.createElement('textarea'); input.id='heist-npc-input';
    input.placeholder='Ask CIPHER anything...'; input.rows=2;
    const footer=document.createElement('div'); footer.id='heist-npc-footer';
    footer.textContent='ENTER to send  •  ESC to close';
    const sendBtn=document.createElement('button'); sendBtn.id='heist-npc-send'; sendBtn.textContent='[ SEND ]';
    footer.appendChild(sendBtn);
    panel.appendChild(header); panel.appendChild(response); panel.appendChild(input); panel.appendChild(footer);
    document.getElementById('heist-shell')?.appendChild(panel)||document.body.appendChild(panel);
    const sendMessage=async()=>{
      const msg=input.value.trim(); if (!msg) return;
      input.value=''; await ChatPanel.sendToBackend(npc,msg,response);
    };
    ['keydown','keyup','keypress'].forEach(ev=>input.addEventListener(ev,e=>e.stopPropagation()));
    input.onkeypress=e=>{ e.stopPropagation(); if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();} };
    input.onkeydown=e=>{ e.stopPropagation(); if(e.key==='Escape')ChatPanel.destroy(); };
    sendBtn.onclick=sendMessage;
    setTimeout(()=>input.focus(),80);
  },
  destroy() { document.getElementById('heist-npc-panel')?.remove(); },
  async sendToBackend(npc,userMessage,responseEl) {
    npc.chatHistory.push({role:'user',message:userMessage});
    ChatPanel.showResponse('Thinking...',responseEl);
    try {
      const response=await fetch(pythonURI()+'/api/ainpc/prompt',{
        ...fetchOptions(),method:'POST',
        body:JSON.stringify({prompt:userMessage,session_id:'ghost-cipher-lobby',npc_type:npc.expertise,expertise:npc.expertise,
          knowledgeContext:'You are CIPHER, a shady informant in the lobby of AEGIS Financial Tower. You help the player (a master thief codenamed GHOST). Stay in character but answer helpfully.'})
      });
      const data=await response.json();
      const aiResponse=data?.response||"I'm drawing a blank on that one.";
      npc.chatHistory.push({role:'ai',message:aiResponse});
      ChatPanel.showResponse('CIPHER: '+aiResponse,responseEl);
    } catch(err) { ChatPanel.showResponse('CIPHER: Signal lost.',responseEl); }
  },
  showResponse(text,el,speed=22) {
    el.textContent=''; let i=0;
    const type=()=>{ if(i<text.length){el.textContent+=text[i++];setTimeout(type,speed);} };
    type();
  }
};

// ─── REGISTER LEVEL ──────────────────────────────────────────
registerLevel({
  walls: buildBorderWalls(COLS, ROWS).concat([
    ...rectWall(2,4,6,1), ...rectWall(10,4,5,1),
    ...rectWall(2,9,4,1), ...rectWall(8,9,5,1),
    ...rectWall(15,6,1,5),...rectWall(5,7,2,1),
    ...rectWall(12,11,3,1),...rectWall(18,3,2,3),
    ...rectWall(18,9,2,3),
  ]),
  start: { x:1, y:7 },
  goal:  { x:19, y:6, w:2, h:3 },
  // Shadow zones: dark corners players can hide in
  shadowZones: [
    { x:1,  y:1,  w:2, h:3 },   // top-left corner
    { x:1,  y:10, w:2, h:4 },   // bottom-left corner
    { x:17, y:12, w:3, h:2 },   // bottom-right alcove
  ],
  gems: [
    {x:4,y:2,color:'#00c8ff'},{x:8,y:2,color:'#ff00cc'},
    {x:12,y:2,color:'#00c8ff'},{x:16,y:2,color:'#ff00cc'},
    {x:2,y:6,color:'#00c8ff'},{x:7,y:6,color:'#ff00cc'},
    {x:11,y:6,color:'#00c8ff'},
    {x:4,y:11,color:'#ff00cc'},{x:8,y:12,color:'#00c8ff'},
    {x:13,y:13,color:'#ff00cc'},{x:17,y:11,color:'#00c8ff'},
    {x:20,y:2,color:'#ff00cc'},{x:20,y:13,color:'#00c8ff'},
  ],
  guards: [],
});

// ─── INTRO SCENES ────────────────────────────────────────────
export const INTRO_SCENES = [
  { label:'// GHOST PROTOCOL — MISSION INIT',
    text:'Booting <span class="highlight">H.E.I.S.T.EXE</span>...\nHigh-Efficiency Infiltration & Stealth Toolkit\n\nAgent status: <span class="success">ACTIVE</span>\nTarget facility: AEGIS FINANCIAL TOWER\nMission classification: <span class="danger">BLACK OPS</span>' },
  { label:'// OPERATIVE DOSSIER',
    text:'You are <span class="highlight">GHOST</span> — the most elusive thief in the world.\n\nYour specialty: penetrating impossible security,\nvanishing without a trace, and walking out\nwith everything they said couldn\'t be stolen.\n\nYou\'ve cracked 14 vaults across 9 countries.\n<span class="highlight">No one has ever seen your face.</span>' },
  { label:'// INTELLIGENCE BRIEFING',
    text:'<span class="danger">SITUATION CRITICAL.</span>\n\nAEGIS Corporation has seized assets belonging\nto dozens of whistleblowers — evidence locked\nbehind their vault network.\n\nFour floors. Four vaults. All interconnected.\n<span class="highlight">You have 90 minutes before the system reboots.</span>' },
  { label:'// TARGET: THE GEMS',
    text:'Each floor contains encrypted <span class="highlight">data gems</span> —\nstolen evidence encoded into quantum crystals.\n\nCollect every gem. Reach the extraction point.\nDo not get caught.\n\nGuards on upper floors patrol with <span class="danger">lethal protocols.</span>\n<span class="highlight">HOLD SHIFT</span> to sprint — but guards will hear you.' },
  { label:'// DEPLOYING TO FLOOR 1',
    text:'Floor 1: THE LOBBY\nSecurity level: <span class="success">MINIMAL</span>\nGuards on duty: <span class="success">NONE</span>\n\n<span class="highlight">Dark corners</span> provide cover — guards cannot see you there.\nAn informant named <span class="highlight">CIPHER</span> is waiting.\nPress <span class="highlight">[E]</span> to talk.\n\nPress <span class="highlight">ESC</span> to access settings.' },
];