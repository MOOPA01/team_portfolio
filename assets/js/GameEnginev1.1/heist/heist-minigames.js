// =============================================================
//  H.E.I.S.T.EXE  —  heist-minigames.js
// =============================================================

// ─── SHARED HELPERS ──────────────────────────────────────────
function createOverlay(id) {
  const el = document.createElement('div');
  el.id = id;
  el.style.cssText = `position:fixed;inset:0;z-index:9600;background:rgba(0,0,0,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Share Tech Mono',monospace;color:#99b0cc;gap:0;`;
  document.getElementById('heist-shell').appendChild(el);
  return el;
}
function removeOverlay(id) { document.getElementById(id)?.remove(); }
function mgTitle(text) {
  const h = document.createElement('div');
  h.style.cssText = `font-family:'Orbitron',monospace;font-size:0.7rem;font-weight:900;letter-spacing:0.3em;color:#00e87a;margin-bottom:8px;text-transform:uppercase;`;
  h.textContent = text; return h;
}
function mgSub(text) {
  const s = document.createElement('div');
  s.style.cssText = `font-size:0.75rem;color:#445577;letter-spacing:0.1em;margin-bottom:20px;text-align:center;max-width:420px;line-height:1.6;`;
  s.textContent = text; return s;
}
function mgStatus(el, text, color = '#99b0cc') { el.style.color = color; el.textContent = text; }

// ─── ROUTER ──────────────────────────────────────────────────
export function runMinigame(index, onComplete) {
  if      (index === 0) runSimonSays(onComplete);
  else if (index === 1) runSafeCrack(onComplete);
  else if (index === 2) runFrequencyIntercept(onComplete);
  else onComplete();
}

// =============================================================
//  MINIGAME 1 — SIMON SAYS
// =============================================================
function runSimonSays(onComplete) {
  const COLORS = [
    { id:'R', fill:'#cc2244', lit:'#ff4466', label:'RED'  },
    { id:'G', fill:'#007744', lit:'#00e87a', label:'GRN'  },
    { id:'B', fill:'#003399', lit:'#3399ff', label:'BLU'  },
    { id:'Y', fill:'#886600', lit:'#ffcc00', label:'YLW'  },
  ];
  const ROUNDS = 3;
  let sequence = [], playerIdx = 0, locked = true;

  const overlay = createOverlay('mg-simon');
  overlay.appendChild(mgTitle('// SIGNAL PROTOCOL'));
  overlay.appendChild(mgSub('Memorise the guard frequency pattern. Repeat it back.'));

  const statusEl = document.createElement('div');
  statusEl.style.cssText = `font-size:0.82rem;letter-spacing:0.12em;margin-bottom:20px;min-height:20px;`;
  statusEl.textContent = 'INITIALISING...';
  overlay.appendChild(statusEl);

  const grid = document.createElement('div');
  grid.style.cssText = `display:grid;grid-template-columns:1fr 1fr;gap:12px;`;
  const btns = {};
  COLORS.forEach(c => {
    const btn = document.createElement('button');
    btn.style.cssText = `width:110px;height:90px;border:2px solid rgba(255,255,255,0.1);background:${c.fill};cursor:pointer;font-family:'Orbitron',monospace;font-size:0.6rem;letter-spacing:0.2em;color:rgba(255,255,255,0.4);transition:background 0.08s;`;
    btn.textContent = c.label;
    btn.addEventListener('click', () => onPadClick(c.id));
    grid.appendChild(btn);
    btns[c.id] = { btn, c };
  });
  overlay.appendChild(grid);

  const roundEl = document.createElement('div');
  roundEl.style.cssText = `margin-top:16px;font-size:0.65rem;color:#2a3a52;letter-spacing:0.15em;`;
  overlay.appendChild(roundEl);

  function lightPad(id, on) {
    const { btn, c } = btns[id];
    btn.style.background = on ? c.lit : c.fill;
    btn.style.color = on ? '#000' : 'rgba(255,255,255,0.4)';
  }
  function playSequence(seq, cb) {
    locked = true;
    let i = 0;
    mgStatus(statusEl, 'WATCH THE PATTERN...', '#ffcc00');
    function next() {
      if (i >= seq.length) { setTimeout(cb, 400); return; }
      const id = seq[i++];
      lightPad(id, true);
      setTimeout(() => { lightPad(id, false); setTimeout(next, 300); }, 500);
    }
    setTimeout(next, 600);
  }
  function startRound() {
    sequence.push(COLORS[Math.floor(Math.random()*4)].id);
    playerIdx = 0;
    roundEl.textContent = `ROUND ${sequence.length} / ${ROUNDS}`;
    playSequence(sequence, () => {
      locked = false;
      mgStatus(statusEl, 'YOUR TURN — REPEAT THE SEQUENCE', '#00e87a');
    });
  }
  function onPadClick(id) {
    if (locked) return;
    lightPad(id, true);
    setTimeout(() => lightPad(id, false), 180);
    if (id !== sequence[playerIdx]) {
      locked = true;
      mgStatus(statusEl, 'WRONG SIGNAL — RESTARTING...', '#ff4466');
      sequence = [];
      setTimeout(startRound, 1200);
      return;
    }
    playerIdx++;
    if (playerIdx === sequence.length) {
      locked = true;
      if (sequence.length >= ROUNDS) {
        mgStatus(statusEl, 'SIGNAL MATCHED — ACCESS GRANTED', '#00e87a');
        setTimeout(() => { removeOverlay('mg-simon'); onComplete(); }, 1000);
      } else {
        mgStatus(statusEl, 'CORRECT — NEXT PATTERN...', '#00e87a');
        setTimeout(startRound, 900);
      }
    }
  }
  startRound();
}

// =============================================================
//  MINIGAME 2 — SAFE CRACK (Mastermind)
//  Fixed: secret is frozen at creation, processing lock prevents
//  double-submit, scoring uses a clean pure function.
// =============================================================
function runSafeCrack(onComplete) {
  const CODE_LEN = 4;
  const MAX_TRIES = 6;

  // Generate secret ONCE and freeze it
  const secret = Object.freeze(
    Array.from({length: CODE_LEN}, () => Math.floor(Math.random() * 6) + 1)
  );
  let attempts = 0;
  let processing = false; // lock to prevent double-submit

  // ─── Pure scoring function ────────────────────────────────
  // Returns {bulls, cows} for a guess against the secret.
  // Bulls = correct digit in correct position.
  // Cows  = correct digit in wrong position.
  function scoreGuess(guess, secret) {
    let bulls = 0;
    const secretLeft = [], guessLeft = [];
    for (let i = 0; i < CODE_LEN; i++) {
      if (guess[i] === secret[i]) {
        bulls++;
      } else {
        secretLeft.push(secret[i]);
        guessLeft.push(guess[i]);
      }
    }
    // Count cows from the unmatched digits
    let cows = 0;
    const used = new Array(secretLeft.length).fill(false);
    for (let i = 0; i < guessLeft.length; i++) {
      for (let j = 0; j < secretLeft.length; j++) {
        if (!used[j] && guessLeft[i] === secretLeft[j]) {
          cows++;
          used[j] = true;
          break;
        }
      }
    }
    return { bulls, cows };
  }

  // ─── Build UI ─────────────────────────────────────────────
  const overlay = createOverlay('mg-safe');
  overlay.appendChild(mgTitle('// VAULT COMBINATION'));
  overlay.appendChild(mgSub('Deduce the 4-digit code (digits 1–6).  ● = right place  ○ = right digit, wrong place'));

  const statusEl = document.createElement('div');
  statusEl.style.cssText = `font-size:0.8rem;letter-spacing:0.1em;margin-bottom:12px;min-height:20px;color:#99b0cc;text-align:center;`;
  overlay.appendChild(statusEl);

  const board = document.createElement('div');
  board.style.cssText = `display:flex;flex-direction:column;gap:4px;margin-bottom:14px;min-height:150px;width:340px;font-size:0.88rem;overflow-y:auto;max-height:200px;`;
  overlay.appendChild(board);

  const inputRow = document.createElement('div');
  inputRow.style.cssText = `display:flex;gap:8px;align-items:center;`;

  const inputs = [];
  for (let pos = 0; pos < CODE_LEN; pos++) {
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.maxLength = 1;
    inp.inputMode = 'numeric';
    inp.style.cssText = `
      width:56px;height:60px;text-align:center;
      background:#0a1628;border:2px solid #1e3a5a;
      color:#00e87a;font-size:1.8rem;font-family:'Orbitron',monospace;
      outline:none;caret-color:transparent;
      line-height:60px;padding:0;box-sizing:border-box;
      border-radius:0;-webkit-appearance:none;
    `;
    inp.addEventListener('focus',  function() { this.style.borderColor='#00e87a'; this.style.background='#0d2218'; });
    inp.addEventListener('blur',   function() { this.style.borderColor='#1e3a5a'; this.style.background='#0a1628'; });
    // Only allow digits 1-6, auto-advance
    inp.addEventListener('input', function() {
      const v = this.value.replace(/[^1-6]/g, '');
      this.value = v ? v[v.length - 1] : '';
      if (this.value && pos < CODE_LEN - 1) inputs[pos + 1].focus();
    });
    inp.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && !this.value && pos > 0) {
        e.preventDefault();
        inputs[pos - 1].focus();
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        doSubmit();
      }
    });
    inputRow.appendChild(inp);
    inputs.push(inp);
  }

  const guessBtn = document.createElement('button');
  guessBtn.textContent = 'CHECK';
  guessBtn.style.cssText = `padding:10px 18px;background:transparent;border:1px solid rgba(0,232,122,0.4);color:#00e87a;font-family:'Orbitron',monospace;font-size:0.65rem;letter-spacing:0.15em;cursor:pointer;white-space:nowrap;`;
  guessBtn.addEventListener('click', function(e) { e.preventDefault(); doSubmit(); });
  inputRow.appendChild(guessBtn);
  overlay.appendChild(inputRow);

  const hintEl = document.createElement('div');
  hintEl.style.cssText = `margin-top:8px;font-size:0.68rem;color:#2a3a52;letter-spacing:0.08em;`;
  hintEl.textContent = `${MAX_TRIES} attempts remaining`;
  overlay.appendChild(hintEl);

  setTimeout(() => inputs[0].focus(), 80);

  // ─── Submit logic ─────────────────────────────────────────
  function doSubmit() {
    if (processing) return;

    // Read current values
    const guessVals = inputs.map(inp => parseInt(inp.value, 10));

    // Validate all filled
    if (guessVals.some(v => isNaN(v) || v < 1 || v > 6)) {
      mgStatus(statusEl, 'ENTER ALL 4 DIGITS (1–6)', '#ffcc00');
      return;
    }

    processing = true;
    guessBtn.disabled = true;
    attempts++;

    const { bulls, cows } = scoreGuess(guessVals, secret);

    // Append row to history board
    const row = document.createElement('div');
    row.style.cssText = `display:flex;gap:10px;align-items:center;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.04);`;
    const attemptStr = String(attempts).padStart(2, ' ');
    const guessStr   = guessVals.join(' ');
    const bullDots   = '●'.repeat(bulls);
    const cowDots    = '○'.repeat(cows);
    const emptyDots  = '·'.repeat(CODE_LEN - bulls - cows);
    row.innerHTML = `
      <span style="color:#2a3a52;font-size:0.75rem;min-width:22px;">#${attemptStr}</span>
      <span style="color:#d0e0f0;letter-spacing:0.2em;min-width:80px;">${guessStr}</span>
      <span style="color:#00e87a;letter-spacing:0.08em;font-size:1rem;">${bullDots}${cowDots}<span style="color:#2a3a52">${emptyDots}</span></span>
    `;
    board.appendChild(row);
    board.scrollTop = board.scrollHeight;

    // Win condition
    if (bulls === CODE_LEN) {
      mgStatus(statusEl, 'VAULT OPEN — ACCESS GRANTED', '#00e87a');
      hintEl.textContent = '';
      setTimeout(() => { removeOverlay('mg-safe'); onComplete(); }, 1000);
      return;
    }

    // Out of attempts
    if (attempts >= MAX_TRIES) {
      guessBtn.disabled = true;
      mgStatus(statusEl, `FAILED — CODE WAS: ${secret.join(' ')} — +30s PENALTY`, '#ff4466');
      hintEl.textContent = '';
      // Time penalty: add 30s to the run timer offset
      if (window._heistAddPenalty) window._heistAddPenalty(30000);
      setTimeout(() => { removeOverlay('mg-safe'); onComplete(); }, 2000);
      return;
    }

    // Continue
    const left = MAX_TRIES - attempts;
    mgStatus(statusEl, `${bulls}● correct position  ${cows}○ correct digit  —  ${left} left`, '#99b0cc');
    hintEl.textContent = `${left} attempt${left === 1 ? '' : 's'} remaining`;

    // Clear inputs and re-enable
    inputs.forEach(inp => { inp.value = ''; });
    inputs[0].focus();
    guessBtn.disabled = false;
    processing = false;
  }
}

// =============================================================
//  MINIGAME 3 — FREQUENCY INTERCEPT
//  Theme: GHOST intercepts 3 guard radio frequencies before
//  the security team notices the tap.
//
//  Mechanic: A dial sweeps a 0–999 range. Left/right arrows
//  move the needle. Three hidden target frequencies must be
//  found. When within ±8 of a target, "SIGNAL LOCK" flashes —
//  hold still for 1.5s to capture it. Repeat for all 3.
//  A "warm/cold" bar guides the player.
// =============================================================
function runFrequencyIntercept(onComplete) {
  // Generate 3 distinct targets spread across the range
  function randTarget() { return Math.floor(Math.random() * 880) + 60; } // 60–940
  const targets = [];
  while (targets.length < 3) {
    const t = randTarget();
    if (targets.every(x => Math.abs(x - t) > 80)) targets.push(t);
  }
  targets.sort((a, b) => a - b);

  let dial    = 500;       // current dial position 0–999
  let locked  = 0;         // number captured so far
  let lockTimer = 0;       // frames holding in lock zone
  const LOCK_HOLD   = 90; // frames to hold (~1.5s at 60fps)
  const SNAP_RANGE  = 8;  // ±8 dial units = "lock zone"
  const WARM_RANGE  = 80; // ±80 = "warm"
  const DIAL_STEP   = 3;
  const CAPTURED_TARGETS = new Set();

  let animId = null;
  const keys = {};

  const overlay = createOverlay('mg-freq');
  overlay.appendChild(mgTitle('// FREQUENCY INTERCEPT'));
  overlay.appendChild(mgSub('Sweep the dial to intercept guard communications. Hold still on a signal to lock it. Capture all 3 frequencies.'));

  // Status line
  const statusEl = document.createElement('div');
  statusEl.style.cssText = `font-size:0.82rem;letter-spacing:0.12em;margin-bottom:18px;min-height:20px;color:#99b0cc;`;
  statusEl.textContent = `CHANNELS REMAINING: 3`;
  overlay.appendChild(statusEl);

  // Canvas for the dial visualisation
  const W = 500, H = 160;
  const cvs = document.createElement('canvas');
  cvs.width = W; cvs.height = H;
  cvs.style.cssText = `display:block;border:1px solid #1a2840;`;
  overlay.appendChild(cvs);
  const c = cvs.getContext('2d');

  // Proximity/warmth bar
  const barWrap = document.createElement('div');
  barWrap.style.cssText = `width:500px;height:8px;background:#0a1020;margin-top:6px;border:1px solid #1a2840;position:relative;overflow:hidden;`;
  const barFill = document.createElement('div');
  barFill.style.cssText = `height:100%;width:0%;background:#445577;transition:background 0.1s;`;
  barWrap.appendChild(barFill);
  overlay.appendChild(barWrap);

  // Lock progress bar
  const lockWrap = document.createElement('div');
  lockWrap.style.cssText = `width:500px;height:6px;background:#0a1020;margin-top:4px;border:1px solid #1a2840;`;
  const lockFill = document.createElement('div');
  lockFill.style.cssText = `height:100%;width:0%;background:#00e87a;transition:none;`;
  lockWrap.appendChild(lockFill);
  overlay.appendChild(lockWrap);

  // Hint
  const hintEl = document.createElement('div');
  hintEl.style.cssText = `margin-top:10px;font-size:0.65rem;color:#2a3a52;letter-spacing:0.12em;`;
  hintEl.textContent = '◄ ► ARROW KEYS TO SWEEP DIAL';
  overlay.appendChild(hintEl);

  // ─── Render ───────────────────────────────────────────────
  function render() {
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);

    // Frequency scale labels
    c.font = '9px "Share Tech Mono",monospace'; c.fillStyle = '#2a3a52';
    for (let f = 0; f <= 1000; f += 100) {
      const x = (f / 1000) * W;
      c.textAlign = 'center';
      c.fillText(f, x, H - 6);
      c.beginPath(); c.moveTo(x, H - 20); c.lineTo(x, H - 14);
      c.strokeStyle = '#1a2840'; c.lineWidth = 1; c.stroke();
    }

    // Draw captured targets as solid ticks
    CAPTURED_TARGETS.forEach(t => {
      const tx = (t / 1000) * W;
      c.fillStyle = '#00e87a';
      c.fillRect(tx - 2, 20, 4, H - 44);
      c.font = '8px "Share Tech Mono"'; c.fillStyle = '#00e87a';
      c.textAlign = 'center'; c.fillText('LOCKED', tx, 16);
    });

    // Warmth background glow behind needle
    const nearestDist = getNearestDist();
    if (nearestDist < WARM_RANGE && !isInLockZone()) {
      const alpha = (1 - nearestDist / WARM_RANGE) * 0.15;
      const nx = (dial / 1000) * W;
      const grad = c.createLinearGradient(nx - 60, 0, nx + 60, 0);
      grad.addColorStop(0, 'rgba(255,200,0,0)');
      grad.addColorStop(0.5, `rgba(255,200,0,${alpha})`);
      grad.addColorStop(1, 'rgba(255,200,0,0)');
      c.fillStyle = grad; c.fillRect(0, 0, W, H);
    }

    // Lock zone flash
    if (isInLockZone()) {
      const nx = (dial / 1000) * W;
      const flash = Math.sin(Date.now() * 0.015) * 0.5 + 0.5;
      c.fillStyle = `rgba(0,232,122,${0.08 + flash * 0.12})`;
      c.fillRect(nx - 20, 0, 40, H);
    }

    // Needle
    const nx = (dial / 1000) * W;
    const inLock = isInLockZone();
    c.strokeStyle = inLock ? '#00e87a' : '#cc2244';
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(nx, 10); c.lineTo(nx, H - 24); c.stroke();
    // Needle head
    c.beginPath(); c.arc(nx, 10, 5, 0, Math.PI * 2);
    c.fillStyle = inLock ? '#00e87a' : '#cc2244'; c.fill();

    // Frequency readout
    c.font = 'bold 18px "Orbitron",monospace';
    c.fillStyle = inLock ? '#00e87a' : '#ff6644';
    c.textAlign = 'center';
    c.fillText(String(dial).padStart(3, '0') + ' MHz', W / 2, 56);
    c.textAlign = 'left';
  }

  function getNearestDist() {
    let min = Infinity;
    for (const t of targets) {
      if (CAPTURED_TARGETS.has(t)) continue;
      min = Math.min(min, Math.abs(dial - t));
    }
    return min;
  }

  function isInLockZone() {
    for (const t of targets) {
      if (CAPTURED_TARGETS.has(t)) continue;
      if (Math.abs(dial - t) <= SNAP_RANGE) return true;
    }
    return false;
  }

  function getCurrentTarget() {
    for (const t of targets) {
      if (!CAPTURED_TARGETS.has(t) && Math.abs(dial - t) <= SNAP_RANGE) return t;
    }
    return null;
  }

  // ─── Game loop ────────────────────────────────────────────
  let moving = false;
  function gameLoop() {
    // Move dial
    const wasMoving = moving;
    if (keys['ArrowLeft'])  { dial = Math.max(0,   dial - DIAL_STEP); moving = true; }
    else if (keys['ArrowRight']) { dial = Math.min(999, dial + DIAL_STEP); moving = true; }
    else moving = false;

    // Warm/cold bar
    const dist = getNearestDist();
    if (dist < WARM_RANGE) {
      const pct = Math.max(0, 100 - (dist / WARM_RANGE) * 100);
      barFill.style.width = pct + '%';
      barFill.style.background = dist < SNAP_RANGE * 3 ? '#ffcc00' : dist < SNAP_RANGE * 6 ? '#ff8800' : '#445577';
    } else {
      barFill.style.width = '0%';
      barFill.style.background = '#445577';
    }

    // Lock progress
    if (isInLockZone() && !moving) {
      lockTimer++;
      lockFill.style.width = (lockTimer / LOCK_HOLD * 100) + '%';
      if (lockTimer >= LOCK_HOLD) {
        const t = getCurrentTarget();
        if (t !== null) {
          CAPTURED_TARGETS.add(t);
          lockTimer = 0;
          lockFill.style.width = '0%';
          const remaining = targets.length - CAPTURED_TARGETS.size;
          if (remaining === 0) {
            mgStatus(statusEl, 'ALL FREQUENCIES LOCKED — COMM INTERCEPT ACTIVE', '#00e87a');
            hintEl.textContent = '';
            barFill.style.width = '100%'; barFill.style.background = '#00e87a';
            cancelAnimationFrame(animId);
            window.removeEventListener('keydown', keyHandler);
            window.removeEventListener('keyup',   keyUpHandler);
            render();
            setTimeout(() => { removeOverlay('mg-freq'); onComplete(); }, 1200);
            return;
          } else {
            mgStatus(statusEl, `LOCKED — ${remaining} CHANNEL${remaining === 1 ? '' : 'S'} REMAINING`, '#00e87a');
          }
        }
      }
    } else {
      lockTimer = Math.max(0, lockTimer - 2); // decay quickly when moving
      lockFill.style.width = (lockTimer / LOCK_HOLD * 100) + '%';
    }

    // Status hint
    if (isInLockZone()) {
      hintEl.textContent = 'SIGNAL DETECTED — HOLD STILL TO LOCK';
      hintEl.style.color = '#00e87a';
    } else if (dist < WARM_RANGE * 0.4) {
      hintEl.style.color = '#ffcc00';
      hintEl.textContent = '▲ SIGNAL NEARBY';
    } else if (dist < WARM_RANGE * 0.75) {
      hintEl.style.color = '#ff8800';
      hintEl.textContent = '~ WARM';
    } else {
      hintEl.style.color = '#2a3a52';
      hintEl.textContent = '◄ ► ARROW KEYS TO SWEEP DIAL';
    }

    render();
    animId = requestAnimationFrame(gameLoop);
  }

  function keyHandler(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault(); keys[e.key] = true;
    }
  }
  function keyUpHandler(e) { keys[e.key] = false; }
  window.addEventListener('keydown', keyHandler);
  window.addEventListener('keyup',   keyUpHandler);

  mgStatus(statusEl, 'CHANNELS REMAINING: 3', '#99b0cc');
  animId = requestAnimationFrame(gameLoop);
}