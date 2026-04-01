// =============================================================
//  H.E.I.S.T.EXE  —  heist-level-1.js
//  Sector: THE LOBBY  |  Difficulty: ROOKIE
//  NPC: CIPHER — AI informant, talks to player via backend
// =============================================================

const _coreUrl = new URL('./heist-core.js', import.meta.url).href;
const { registerLevel, buildBorderWalls, rectWall, COLS, ROWS, CELL } = await import(_coreUrl);

// pythonURI + fetchOptions are exposed as window globals by heist.md
// before this module loads (via a separate <script type="module"> that
// imports config.js and sets window._pythonURI / window._fetchOptions).
const pythonURI    = () => window._pythonURI    || 'http://localhost:8085';
const fetchOptions = () => window._fetchOptions || { credentials:'include', headers:{'Content-Type':'application/json'} };

// ─── NPC CHAT PANEL ──────────────────────────────────────────
// Mirrors AiNpc.js patterns: same endpoint, same chatHistory,
// same typewriter showResponse, same sendPromptToBackend flow.

const NPC = {
  // Grid position of CIPHER in the lobby
  gridX: 10, gridY: 7,
  r: 9,
  color: '#ffaa00',
  label: 'CIPHER',
  expertise: 'heist intelligence',
  chatHistory: [],
  collectCooldownUntil: 0,

  get x() { return this.gridX * CELL + CELL / 2; },
  get y() { return this.gridY * CELL + CELL / 2; },

  // Draw NPC dot + label on canvas
  draw(ctx, t) {
    const pulse = Math.sin(t * 0.05) * 2;
    // Outer glow ring
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r + 4 + pulse, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,170,0,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Body
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    // Label above
    ctx.fillStyle = '#ffaa00';
    ctx.font = '9px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.label, this.x, this.y - this.r - 6);
    // [E] prompt if player nearby
    if (this._playerNear) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px "Share Tech Mono", monospace';
      ctx.fillText('[E] TALK', this.x, this.y + this.r + 14);
    }
    ctx.textAlign = 'left';
  },

  // Check if player is close enough to interact
  checkProximity(px, py) {
    const dx = px - this.x, dy = py - this.y;
    this._playerNear = Math.sqrt(dx * dx + dy * dy) < 48;
    return this._playerNear;
  },

  // Open the chat panel
  openChat() {
    if (document.getElementById('heist-npc-panel')) return;
    ChatPanel.create(this);
  },

  // Close the chat panel
  closeChat() {
    ChatPanel.destroy();
  }
};

// ─── CHAT PANEL ───────────────────────────────────────────────
// Mirrors AiNpc.js createChatUI + attachEventHandlers + sendPromptToBackend
const ChatPanel = {
  create(npc) {
    // Inject styles once
    if (!document.getElementById('heist-npc-styles')) {
      const style = document.createElement('style');
      style.id = 'heist-npc-styles';
      style.textContent = `
        #heist-npc-panel {
          position: fixed;
          bottom: 32px; left: 50%; transform: translateX(-50%);
          width: min(480px, 92vw);
          background: #0c1220;
          border: 1px solid #ffaa00;
          box-shadow: 0 0 24px rgba(255,170,0,0.15);
          z-index: 9800;
          font-family: 'Share Tech Mono', monospace;
          color: #99b0cc;
          display: flex; flex-direction: column; gap: 0;
          border-radius: 2px;
        }
        #heist-npc-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 16px;
          border-bottom: 1px solid #1e2d4a;
          font-family: 'Orbitron', monospace;
          font-size: 0.7rem; letter-spacing: 0.2em;
          color: #ffaa00;
        }
        #heist-npc-close {
          background: none; border: none; color: #445577;
          cursor: pointer; font-size: 1rem; line-height: 1;
          font-family: monospace; padding: 0 4px;
        }
        #heist-npc-close:hover { color: #ffaa00; }
        #heist-npc-response {
          min-height: 64px; max-height: 180px;
          overflow-y: auto;
          padding: 12px 16px;
          font-size: 0.85rem; line-height: 1.7;
          color: #8899aa;
          white-space: pre-wrap;
          border-bottom: 1px solid #131e30;
        }
        #heist-npc-input {
          width: 100%; box-sizing: border-box;
          background: transparent; border: none;
          border-top: 1px solid #131e30;
          color: #d0e0f0;
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.85rem;
          padding: 10px 16px;
          resize: none; outline: none;
        }
        #heist-npc-input::placeholder { color: #2a3a52; }
        #heist-npc-footer {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 16px;
          border-top: 1px solid #131e30;
          font-size: 0.65rem; color: #2a3a52; letter-spacing: 0.1em;
        }
        #heist-npc-send {
          background: transparent;
          border: 1px solid #1e3a2a; color: #88bb99;
          font-family: 'Orbitron', monospace; font-size: 0.65rem;
          letter-spacing: 0.15em; padding: 5px 14px;
          cursor: pointer; text-transform: uppercase;
          transition: border-color 0.15s, color 0.15s;
        }
        #heist-npc-send:hover { border-color: #ffaa00; color: #ffaa00; }
      `;
      document.head.appendChild(style);
    }

    const panel = document.createElement('div');
    panel.id = 'heist-npc-panel';

    // Header
    const header = document.createElement('div');
    header.id = 'heist-npc-header';
    header.innerHTML = `<span>// CIPHER — LOBBY INFORMANT</span>`;
    const closeBtn = document.createElement('button');
    closeBtn.id = 'heist-npc-close';
    closeBtn.textContent = '✕';
    closeBtn.onclick = () => ChatPanel.destroy();
    header.appendChild(closeBtn);

    // Response area — mirrors AiNpc showResponse target
    const response = document.createElement('div');
    response.id = 'heist-npc-response';
    response.textContent = 'CIPHER: Need intel? Ask me anything.';

    // Input — mirrors AiNpc inputField
    const input = document.createElement('textarea');
    input.id = 'heist-npc-input';
    input.placeholder = 'Ask CIPHER anything...';
    input.rows = 2;

    // Footer + send button
    const footer = document.createElement('div');
    footer.id = 'heist-npc-footer';
    footer.textContent = 'ENTER to send  •  SHIFT+ENTER new line  •  ESC to close';
    const sendBtn = document.createElement('button');
    sendBtn.id = 'heist-npc-send';
    sendBtn.textContent = '[ SEND ]';

    footer.appendChild(sendBtn);
    panel.appendChild(header);
    panel.appendChild(response);
    panel.appendChild(input);
    panel.appendChild(footer);
    document.getElementById('heist-shell')?.appendChild(panel) 
      || document.body.appendChild(panel);

    // ── Event handlers (mirrors AiNpc.attachEventHandlers) ──
    const sendMessage = async () => {
      const msg = input.value.trim();
      if (!msg) return;
      input.value = '';
      await ChatPanel.sendToBackend(npc, msg, response);
    };

    // Prevent game keys from firing while typing
    ['keydown','keyup','keypress'].forEach(ev => {
      input.addEventListener(ev, e => e.stopPropagation());
    });

    input.onkeypress = e => {
      e.stopPropagation();
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    };

    // ESC closes panel
    input.onkeydown = e => {
      e.stopPropagation();
      if (e.key === 'Escape') ChatPanel.destroy();
    };

    sendBtn.onclick = sendMessage;

    setTimeout(() => input.focus(), 80);
  },

  destroy() {
    document.getElementById('heist-npc-panel')?.remove();
  },

  // Mirrors AiNpc.sendPromptToBackend exactly
  async sendToBackend(npc, userMessage, responseEl) {
    npc.chatHistory.push({ role: 'user', message: userMessage });

    ChatPanel.showResponse('Thinking...', responseEl);

    try {
      const sessionId = `ghost-cipher-lobby`;
      const pythonURL = pythonURI() + '/api/ainpc/prompt';

      const response = await fetch(pythonURL, {
        ...fetchOptions(),
        method: 'POST',
        body: JSON.stringify({
          prompt: userMessage,
          session_id: sessionId,
          npc_type: npc.expertise,
          expertise: npc.expertise,
          knowledgeContext: 'You are CIPHER, a shady informant in the lobby of AEGIS Financial Tower. You help the player (a master thief codenamed GHOST) with any questions they have. Stay in character but answer helpfully.'
        })
      });

      const data = await response.json();

      if (data.status === 'error') {
        ChatPanel.showResponse(
          'CIPHER: My comms are scrambled. Try again.',
          responseEl
        );
        return;
      }

      const aiResponse = data?.response || "I'm drawing a blank on that one.";
      npc.chatHistory.push({ role: 'ai', message: aiResponse });
      ChatPanel.showResponse('CIPHER: ' + aiResponse, responseEl);

    } catch (err) {
      console.error('CIPHER NPC error:', err);
      ChatPanel.showResponse(
        'CIPHER: Signal lost. Check your connection.',
        responseEl
      );
    }
  },

  // Mirrors AiNpc.showResponse — typewriter effect
  showResponse(text, el, speed = 22) {
    el.textContent = '';
    let i = 0;
    const type = () => {
      if (i < text.length) { el.textContent += text[i++]; setTimeout(type, speed); }
    };
    type();
  }
};

// ─── REGISTER LEVEL ──────────────────────────────────────────
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
    { x: 4,  y: 2,  color: '#00c8ff' }, { x: 8,  y: 2,  color: '#ff00cc' },
    { x: 12, y: 2,  color: '#00c8ff' }, { x: 16, y: 2,  color: '#ff00cc' },
    { x: 2,  y: 6,  color: '#00c8ff' }, { x: 7,  y: 6,  color: '#ff00cc' },
    { x: 11, y: 6,  color: '#00c8ff' },
    { x: 4,  y: 11, color: '#ff00cc' }, { x: 8,  y: 12, color: '#00c8ff' },
    { x: 13, y: 13, color: '#ff00cc' }, { x: 17, y: 11, color: '#00c8ff' },
    { x: 20, y: 2,  color: '#ff00cc' }, { x: 20, y: 13, color: '#00c8ff' },
  ],
  guards: [],

  // Called by heist-core each frame with (ctx, t, playerX, playerY)
  onDraw(ctx, t, px, py) {
    NPC.checkProximity(px, py);
    NPC.draw(ctx, t);
  },

  // Called by heist-core when E key is pressed
  onInteract(px, py) {
    if (NPC._playerNear) {
      NPC.openChat();
    }
  },

  // Called by heist-core when level ends / player leaves
  onUnload() {
    NPC.closeChat();
    NPC.chatHistory = [];
  }
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
    text:'Each floor contains encrypted <span class="highlight">data gems</span> —\nstolen evidence encoded into quantum crystals.\n\nCollect every gem. Reach the extraction point.\nDo not get caught.\n\nGuards on upper floors patrol with <span class="danger">lethal protocols.</span>\nOne touch. You\'re done.' },
  { label:'// DEPLOYING TO FLOOR 1',
    text:'Floor 1: THE LOBBY\nSecurity level: <span class="success">MINIMAL</span>\nGuards on duty: <span class="success">NONE</span>\n\nAn informant named <span class="highlight">CIPHER</span> is waiting in the lobby.\nPress <span class="highlight">[E]</span> to talk.\n\n<span class="highlight">The vault awaits. Move silently.</span>' },
];
