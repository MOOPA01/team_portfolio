// =============================================================
//  H.E.I.S.T.EXE  —  heist-game-combined.js
//  Combined core logic + CSS in one file for GameEngine
// =============================================================

import { initNPCSystem }   from './heist-npc.js';
import { initLeaderboard } from './heist-leaderboard.js';
import { runMinigame }     from './heist-minigames.js';

// ─── CSS INJECTION ──────────────────────────────────────────
// Inject all heist styling as a <style> element on module load
function injectHeistCSS() {
  const styleId = 'heist-game-combined-styles';
  if (document.getElementById(styleId)) return; // Already injected
  
  const styleEl = document.createElement('style');
  styleEl.id = styleId;
  styleEl.textContent = `
/* =============================================================
   H.E.I.S.T.EXE  —  heist-game.css  (VISUAL UPGRADE)
   ============================================================= */

@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');

:root {
  --bg:      #060a14;
  --surface: #0b1120;
  --border:  #1a2840;
  --text:    #99b0cc;
  --dim:     #3a4d66;
  --white:   #d0e8ff;
  --cyan:    #00fff9;
  --yellow:  #ffee00;
  --green:   #00e87a;
  --pink:    #ff1155;
  --purple:  #aa00ff;
  --green-glow: rgba(0,232,122,0.35);
  --cyan-glow:  rgba(0,255,249,0.25);
  --pink-glow:  rgba(255,17,85,0.35);
}

/* ── KEYFRAMES ───────────────────────────────────────────────── */
@keyframes scanline {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
@keyframes flicker {
  0%,100% { opacity: 1; }
  92%      { opacity: 1; }
  93%      { opacity: 0.85; }
  94%      { opacity: 1; }
  96%      { opacity: 0.9; }
  97%      { opacity: 1; }
}
@keyframes titlePulse {
  0%,100% { text-shadow: 0 0 20px var(--green-glow), 0 0 40px rgba(0,232,122,0.2), 0 0 80px rgba(0,232,122,0.08); }
  50%     { text-shadow: 0 0 30px var(--green-glow), 0 0 60px rgba(0,232,122,0.3), 0 0 100px rgba(0,232,122,0.12), 0 0 140px rgba(0,232,122,0.05); }
}
@keyframes hudPulse {
  0%,100% { color: var(--green); }
  50%     { color: #00ffaa; text-shadow: 0 0 8px rgba(0,232,122,0.6); }
}
@keyframes borderGlow {
  0%,100% { box-shadow: 0 0 20px rgba(0,232,122,0.06), 0 0 40px rgba(0,100,200,0.04), inset 0 0 20px rgba(0,0,0,0.3); }
  50%     { box-shadow: 0 0 30px rgba(0,232,122,0.12), 0 0 60px rgba(0,100,200,0.06), 0 0 100px rgba(0,232,122,0.03), inset 0 0 20px rgba(0,0,0,0.3); }
}
@keyframes overlayGridMove {
  0%   { background-position: 0 0; }
  100% { background-position: 32px 32px; }
}
@keyframes btnGlitch {
  0%,95%,100% { transform: none; clip-path: none; }
  96% { transform: translate(2px,0) skewX(-2deg); clip-path: polygon(0 20%,100% 20%,100% 40%,0 40%); }
  97% { transform: translate(-2px,0) skewX(2deg); clip-path: polygon(0 60%,100% 60%,100% 80%,0 80%); }
  98% { transform: none; clip-path: none; }
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes endPanelIn {
  from { opacity: 0; transform: scale(0.93) translateY(20px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes statCountUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes cornerBlink {
  0%,49%,100% { opacity: 1; }
  50%,99%     { opacity: 0.3; }
}
@keyframes scanPing {
  0%   { transform: scaleX(0); opacity: 0.9; }
  100% { transform: scaleX(1); opacity: 0; }
}
@keyframes glitchShift {
  0%,90%,100% { clip-path: none; transform: none; }
  91% { clip-path: polygon(0 15%,100% 15%,100% 30%,0 30%); transform: translate(-3px,0); }
  92% { clip-path: polygon(0 55%,100% 55%,100% 70%,0 70%); transform: translate(3px,0); }
  93% { clip-path: none; transform: none; }
}
@keyframes npcModalIn {
  from { opacity:0; transform: translateX(-50%) translateY(12px) scale(0.97); }
  to   { opacity:1; transform: translateX(-50%) translateY(0)   scale(1); }
}
@keyframes cursorBlink {
  0%,100% { opacity:1; } 50% { opacity:0; }
}
@keyframes cornerRotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes hintPop {
  0%   { opacity:0; transform:translateX(-50%) translateY(6px) scale(0.95); }
  100% { opacity:1; transform:translateX(-50%) translateY(0)   scale(1); }
}

/* ── SHELL ───────────────────────────────────────────────────── */
#heist-shell {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: #000000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px 0 40px;
  font-family: 'Share Tech Mono', monospace;
  color: var(--text);
  user-select: none;
}

/* ── FULLSCREEN BUTTON ── */
#fullscreen-btn {
  position: fixed;
  top: 12px; right: 12px;
  z-index: 9500;
  background: rgba(11,17,32,0.9);
  border: 1px solid #1a2840;
  color: #445577;
  width: 36px; height: 36px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  opacity: 0.4;
  transition: opacity 0.2s, border-color 0.2s, box-shadow 0.2s;
  padding: 0;
  clip-path: polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px);
}
#fullscreen-btn:hover {
  opacity: 1;
  border-color: var(--green);
  box-shadow: 0 0 10px rgba(0,232,122,0.3);
}
#fullscreen-btn svg {
  width: 15px; height: 15px;
  fill: none; stroke: #7799bb; stroke-width: 2;
  stroke-linecap: round;
}
#fullscreen-btn:hover svg { stroke: var(--green); }

/* ── WRAPPER ── */
#wrapper {
  position: relative;
  display: flex; flex-direction: column;
  align-items: center; gap: 12px;
  animation: fadeSlideUp 0.6s ease both;
}

/* ── TITLE ── */
#title {
  font-family: 'Orbitron', monospace;
  font-size: 2.2rem; font-weight: 900; letter-spacing: 0.22em;
  color: var(--green);
  text-shadow: 0 0 20px rgba(0,232,122,0.3);
  position: relative;
}

/* ── HUD ── */
#hud {
  display: flex; gap: 0;
  font-size: 0.78rem; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--dim);
  border: 1px solid #1a2840;
  background: rgba(6,10,20,0.8);
  position: relative;
  overflow: hidden;
}
#hud::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--green), transparent);
  opacity: 0.4;
}
.hud-item {
  padding: 7px 22px;
  border-right: 1px solid #1a2840;
  position: relative;
}
.hud-item:last-child { border-right: none; }
.hud-item span {
  color: var(--green);
  font-size: 1.05rem;
  font-family: 'Orbitron', monospace;
  display: inline-block;
  min-width: 1.5ch;
}

/* ── CANVAS WRAP ── */
#canvas-wrap {
  position: relative;
  width: 704px;
  height: 512px;
  border: 1px solid #1e3050;
  box-shadow: 0 0 20px rgba(0,232,122,0.06);
}
#canvas-wrap::before,
#canvas-wrap::after {
  content: '';
  position: absolute;
  width: 18px; height: 18px;
  pointer-events: none;
  z-index: 2;
}
#canvas-wrap::before {
  top: -1px; left: -1px;
  border-top: 2px solid var(--green);
  border-left: 2px solid var(--green);
  box-shadow: -2px -2px 8px rgba(0,232,122,0.4);
}
#canvas-wrap::after {
  bottom: -1px; right: -1px;
  border-bottom: 2px solid var(--green);
  border-right: 2px solid var(--green);
  box-shadow: 2px 2px 8px rgba(0,232,122,0.4);
}

.canvas-corner-tr,
.canvas-corner-bl {
  position: absolute;
  width: 18px; height: 18px;
  pointer-events: none;
  z-index: 2;
}
.canvas-corner-tr {
  top: -1px; right: -1px;
  border-top: 2px solid var(--green);
  border-right: 2px solid var(--green);
  box-shadow: 2px -2px 8px rgba(0,232,122,0.4);
}
.canvas-corner-bl {
  bottom: -1px; left: -1px;
  border-bottom: 2px solid var(--green);
  border-left: 2px solid var(--green);
  box-shadow: -2px 2px 8px rgba(0,232,122,0.4);
}

canvas {
  display: block;
  width: 704px; height: 512px;
}

@media (max-width: 740px) {
  #canvas-wrap, canvas { width: 100vw; height: calc(100vw * 512 / 704); }
}

/* ── OVERLAY (START SCREEN) ── */
#overlay {
  position: fixed; inset: 0;
  z-index: 9100;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: #000000;
  gap: 16px;
}
#overlay.hidden { display: none; }

#overlay-title {
  font-family: 'Orbitron', monospace; font-size: 3rem; font-weight: 900;
  text-align: center; line-height: 1.1; color: var(--white);
  letter-spacing: 0.2em;
  animation: titlePulse 4s ease-in-out infinite, fadeSlideUp 0.7s ease both;
}
#overlay-title.cyan   { color: var(--cyan);   text-shadow: 0 0 30px var(--cyan-glow), 0 0 60px rgba(0,255,249,0.15); }
#overlay-title.pink   { color: var(--pink);   text-shadow: 0 0 30px var(--pink-glow), 0 0 60px rgba(255,17,85,0.15); }
#overlay-title.green  { color: var(--green);  text-shadow: 0 0 30px var(--green-glow), 0 0 60px rgba(0,232,122,0.15); }
#overlay-title.purple { color: var(--purple); text-shadow: 0 0 30px rgba(170,0,255,0.4); }

#overlay-sub {
  font-size: 0.88rem; color: var(--dim);
  letter-spacing: 0.12em; text-align: center; line-height: 2;
  animation: fadeSlideUp 0.7s 0.15s ease both;
}

/* ── BUTTONS ── */
.void-btn {
  padding: 12px 40px;
  font-family: 'Orbitron', monospace; font-size: 0.88rem; font-weight: 700;
  letter-spacing: 0.22em; background: transparent;
  border: 1px solid rgba(0,232,122,0.25); color: #66aa88;
  cursor: pointer; text-transform: uppercase;
  transition: background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.1s;
  position: relative;
  overflow: hidden;
  clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
  animation: fadeSlideUp 0.7s 0.3s ease both, btnGlitch 12s infinite;
}
.void-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(0,232,122,0.06) 50%, transparent 100%);
  transform: translateX(-100%);
  transition: transform 0.4s;
}
.void-btn:hover::before { transform: translateX(100%); }
.void-btn:hover {
  background: rgba(0,232,122,0.1);
  border-color: var(--green);
  color: var(--green);
  box-shadow: 0 0 20px rgba(0,232,122,0.25), inset 0 0 20px rgba(0,232,122,0.05);
  transform: translateY(-1px);
}
.void-btn:active { transform: translateY(0); }

#controls-hint {
  font-size: 0.65rem; color: #253040;
  letter-spacing: 0.12em; text-align: center; margin-top: 2px;
  animation: fadeSlideUp 0.7s 0.45s ease both;
}

/* ── CUTSCENE ── */
#cutscene {
  position: fixed; inset: 0;
  z-index: 9200;
  display: flex; align-items: center; justify-content: center;
  background: rgba(2,4,10,0.97);
  transition: opacity 0.5s;
}
#cutscene.hidden   { display: none; }
#cutscene.fade-out { opacity: 0; pointer-events: none; }
#cs-bg { display: none; }

#cs-content {
  position: relative; z-index: 2;
  width: min(660px, 90vw); padding: 38px 48px;
  border: 1px solid #1a2840;
  background: linear-gradient(145deg, #0c1422 0%, #080e1c 100%);
  display: flex; flex-direction: column; gap: 20px;
  box-shadow: 0 0 60px rgba(0,100,255,0.06), 0 0 120px rgba(0,50,150,0.03), inset 0 1px 0 rgba(255,255,255,0.03);
  transition: opacity 0.3s;
  clip-path: polygon(16px 0%, 100% 0%, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0% 100%, 0% 16px);
}
#cs-content::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(to right, transparent, var(--green), transparent);
  transform-origin: left;
  animation: scanPing 3s ease-in-out infinite;
}

#cs-header {
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid #131e30; padding-bottom: 14px;
}
#cs-title-tag {
  font-family: 'Orbitron', monospace; font-size: 0.72rem; font-weight: 900;
  letter-spacing: 0.28em; color: var(--green);
  text-shadow: 0 0 12px rgba(0,232,122,0.5);
}
#cs-counter { font-size: 0.68rem; color: #253040; letter-spacing: 0.12em; }

#cs-label {
  font-family: 'Orbitron', monospace; font-size: 0.58rem;
  letter-spacing: 0.28em; color: #3a5066; text-transform: uppercase;
  min-height: 14px;
}
#cs-text {
  font-family: 'Share Tech Mono', monospace; font-size: 0.93rem;
  line-height: 2; color: #7a8fa8; min-height: 148px; white-space: pre-wrap;
}
#cs-text .highlight { color: var(--green); text-shadow: 0 0 8px rgba(0,232,122,0.4); }
#cs-text .danger    { color: #ff3355; text-shadow: 0 0 8px rgba(255,51,85,0.4); }
#cs-text .success   { color: var(--cyan); text-shadow: 0 0 8px rgba(0,255,249,0.35); }

#cs-text::after {
  content: '▋';
  animation: cursorBlink 0.9s step-end infinite;
  color: var(--green);
  opacity: 0.7;
}

#cs-btn {
  align-self: flex-end; padding: 9px 24px;
  font-family: 'Orbitron', monospace; font-size: 0.7rem; font-weight: 700;
  letter-spacing: 0.22em; background: transparent;
  color: #446655; border: 1px solid #1a3328;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s;
  clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
}
#cs-btn:hover {
  background: rgba(0,232,122,0.09);
  border-color: var(--green);
  color: var(--green);
  box-shadow: 0 0 14px rgba(0,232,122,0.2);
}

/* ── NPC HINT ── */
#npc-hint {
  display: none;
  position: absolute;
  bottom: -34px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.7rem;
  color: #ffaa00;
  letter-spacing: 0.12em;
  text-shadow: 0 0 10px rgba(255,170,0,0.5);
  pointer-events: none;
  white-space: nowrap;
}
#npc-hint.active {
  display: block;
  animation: hintPop 0.3s ease both;
}

/* ── NPC MODAL ── */
#npc-modal {
  position: fixed;
  inset: 0;
  z-index: 9700;
  display: none;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 40px;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(2px);
}
#npc-modal.active {
  display: flex;
}
#npc-chat {
  width: min(520px, 94vw);
  background: linear-gradient(160deg, #0c1422 0%, #080e1c 100%);
  border: 1px solid rgba(255,170,0,0.4);
  box-shadow: 0 0 40px rgba(255,170,0,0.12), 0 0 80px rgba(255,170,0,0.05), inset 0 1px 0 rgba(255,255,255,0.03);
  display: flex; flex-direction: column;
  clip-path: polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px);
  animation: npcModalIn 0.25s ease both;
}
#npc-chat-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 11px 18px;
  border-bottom: 1px solid rgba(255,170,0,0.15);
  background: rgba(255,170,0,0.04);
}
#npc-chat-title {
  font-family: 'Orbitron', monospace; font-size: 0.65rem;
  letter-spacing: 0.28em; color: #ffaa00;
  text-shadow: 0 0 12px rgba(255,170,0,0.5);
}
#npc-close-btn {
  background: none; border: none; color: #445577;
  cursor: pointer; font-size: 1rem; font-family: monospace;
  padding: 0 2px; transition: color 0.15s;
}
#npc-close-btn:hover { color: #ffaa00; }
#npc-messages {
  min-height: 80px; max-height: 200px; overflow-y: auto;
  padding: 14px 18px; display: flex; flex-direction: column; gap: 8px;
  scrollbar-width: thin; scrollbar-color: #ffaa00 transparent;
}
.npc-message { display: flex; }
.npc-message.user { justify-content: flex-end; }
.npc-message.bot  { justify-content: flex-start; }
.npc-message-bubble {
  max-width: 80%;
  padding: 7px 13px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.82rem; line-height: 1.6;
  border-radius: 0;
}
.npc-message.user .npc-message-bubble {
  background: rgba(0,232,122,0.1);
  border: 1px solid rgba(0,232,122,0.25);
  color: #a0e0b8;
  clip-path: polygon(6px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 6px);
}
.npc-message.bot .npc-message-bubble {
  background: rgba(255,170,0,0.07);
  border: 1px solid rgba(255,170,0,0.2);
  color: #ccaa70;
  clip-path: polygon(0% 0%, calc(100% - 6px) 0%, 100% 6px, 100% 100%, 0% 100%);
}
#npc-input-area {
  display: flex; border-top: 1px solid rgba(255,170,0,0.12);
}
#npc-input {
  flex: 1; background: transparent; border: none;
  color: var(--white); font-family: 'Share Tech Mono', monospace;
  font-size: 0.83rem; padding: 11px 16px; outline: none;
}
#npc-input::placeholder { color: rgba(255,170,0,0.25); }
#npc-send-btn {
  background: transparent; border-left: 1px solid rgba(255,170,0,0.15);
  color: rgba(255,170,0,0.5); font-family: 'Orbitron', monospace;
  font-size: 0.62rem; letter-spacing: 0.15em; padding: 0 18px;
  cursor: pointer; transition: color 0.15s, background 0.15s;
}
#npc-send-btn:hover {
  color: #ffaa00;
  background: rgba(255,170,0,0.06);
}

/* ── END SCREEN ── */
#end-screen {
  position: fixed; inset: 0;
  z-index: 9300;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at 50% 40%, rgba(0,20,10,0.8) 0%, rgba(2,4,10,0.99) 70%);
}
#end-screen.hidden { display: none; }

#end-panel {
  width: min(460px, 90vw); padding: 48px 52px;
  border: 1px solid #1a2840;
  background: linear-gradient(145deg, #0c1422 0%, #080e1c 100%);
  display: flex; flex-direction: column; align-items: center; gap: 28px;
  box-shadow: 0 0 80px rgba(0,232,122,0.1), 0 0 160px rgba(0,232,122,0.04), inset 0 1px 0 rgba(0,232,122,0.06);
  clip-path: polygon(14px 0%, 100% 0%, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0% 100%, 0% 14px);
  animation: endPanelIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  position: relative;
  overflow: hidden;
}
#end-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(to right, transparent 0%, var(--green) 30%, var(--cyan) 70%, transparent 100%);
  opacity: 0.6;
}

#end-title {
  font-family: 'Orbitron', monospace; font-size: 0.72rem; font-weight: 900;
  letter-spacing: 0.38em; color: var(--green); text-transform: uppercase;
  border-bottom: 1px solid #131e30; padding-bottom: 16px; width: 100%;
  text-align: center;
  text-shadow: 0 0 20px rgba(0,232,122,0.6), 0 0 40px rgba(0,232,122,0.2);
  animation: titlePulse 3s ease-in-out infinite;
}

#end-stats { display: flex; flex-direction: column; gap: 18px; width: 100%; }
.end-stat {
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  animation: statCountUp 0.5s ease both;
}
.end-stat:nth-child(3) { animation-delay: 0.1s; }

.end-stat-label {
  font-family: 'Orbitron', monospace; font-size: 0.5rem;
  letter-spacing: 0.28em; color: #2a3a52; text-transform: uppercase;
}
.end-stat-value {
  font-family: 'Orbitron', monospace; font-size: 2.6rem; font-weight: 900;
  color: var(--green); letter-spacing: 0.05em; line-height: 1;
  text-shadow: 0 0 20px rgba(0,232,122,0.4);
}
.end-stat-divider { width: 100%; height: 1px; background: linear-gradient(to right, transparent, #1a2840, transparent); }

#end-play-again {
  padding: 12px 36px;
  font-family: 'Orbitron', monospace; font-size: 0.76rem; font-weight: 700;
  letter-spacing: 0.22em; background: transparent;
  border: 1px solid rgba(0,232,122,0.3); color: var(--green);
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
  text-transform: uppercase;
  clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
  position: relative; overflow: hidden;
}
#end-play-again::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(0,232,122,0.08), transparent);
  transform: translateX(-100%);
  transition: transform 0.4s;
}
#end-play-again:hover::before { transform: translateX(100%); }
#end-play-again:hover {
  background: rgba(0,232,122,0.1);
  box-shadow: 0 0 24px rgba(0,232,122,0.3);
  transform: translateY(-1px);
}
#end-play-again:active { transform: translateY(0); }

/* ── LEADERBOARD (within end panel) ── */
#leaderboard-section {
  margin-top: 8px;
  border-top: 1px solid rgba(0,232,122,0.12);
  padding-top: 20px;
  width: 100%;
  animation: fadeSlideUp 0.5s 0.2s ease both;
}
#leaderboard-title {
  color: var(--green);
  font-family: 'Orbitron', monospace;
  font-size: 0.6rem; font-weight: 900;
  letter-spacing: 0.35em; margin-bottom: 16px;
  text-align: center;
  text-shadow: 0 0 12px rgba(0,232,122,0.4);
}
#player-name-input-group {
  display: flex; gap: 8px; margin-bottom: 16px;
}
#player-name-input {
  flex: 1;
  background: rgba(0,0,0,0.35);
  border: 1px solid rgba(0,232,122,0.2);
  color: var(--green);
  padding: 9px 14px;
  font-family: 'Share Tech Mono', monospace; font-size: 0.82rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  clip-path: polygon(6px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 6px);
}
#player-name-input:focus {
  border-color: var(--green);
  box-shadow: 0 0 12px rgba(0,232,122,0.18);
}
#player-name-input::placeholder { color: rgba(0,232,122,0.25); }
#save-name-btn {
  background: rgba(0,232,122,0.12);
  border: 1px solid rgba(0,232,122,0.3);
  color: var(--green);
  padding: 9px 16px;
  font-family: 'Orbitron', monospace; font-size: 0.6rem;
  letter-spacing: 0.15em; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  clip-path: polygon(0% 0%, calc(100% - 6px) 0%, 100% 6px, 100% 100%, 0% 100%);
}
#save-name-btn:hover {
  background: rgba(0,232,122,0.22);
  box-shadow: 0 0 12px rgba(0,232,122,0.25);
}
#save-name-btn:active { transform: scale(0.96); }

#leaderboard-table {
  width: 100%; border-collapse: collapse; font-size: 0.78rem;
}
#leaderboard-table thead {
  border-bottom: 1px solid rgba(0,232,122,0.2);
}
#leaderboard-table th {
  color: rgba(0,232,122,0.5);
  padding: 8px 10px; text-align: left;
  font-family: 'Orbitron', monospace; font-size: 0.5rem;
  letter-spacing: 0.2em; font-weight: 700;
}
#leaderboard-table td {
  padding: 9px 10px;
  border-bottom: 1px solid rgba(0,232,122,0.06);
  color: rgba(160,220,255,0.7);
  transition: color 0.15s;
}
#leaderboard-table tr.current-player {
  background: rgba(0,232,122,0.07);
}
#leaderboard-table tr.current-player td {
  color: var(--green); font-weight: bold;
}
#leaderboard-table tr:hover td { color: rgba(160,220,255,0.95); }
#leaderboard-table .rank { color: var(--green); font-weight: bold; width: 36px; }
#leaderboard-table .time {
  font-family: 'Share Tech Mono', monospace;
  color: rgba(0,200,255,0.8);
}
#leaderboard-empty {
  text-align: center; color: rgba(0,200,120,0.35);
  padding: 18px; font-style: italic; font-size: 0.78rem;
}

/* ── OVERLAY SECONDARY BUTTONS ── */
#overlay-secondary-btns {
  display: flex;
  gap: 12px;
  margin-top: -2px;
  animation: fadeSlideUp 0.7s 0.4s ease both;
}
.void-btn-sm {
  padding: 7px 22px;
  font-family: 'Orbitron', monospace; font-size: 0.7rem; font-weight: 700;
  letter-spacing: 0.18em; background: transparent;
  border: 1px solid rgba(0,232,122,0.15); color: #3a5a48;
  cursor: pointer; text-transform: uppercase;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.void-btn-sm:hover {
  background: rgba(0,232,122,0.07);
  border-color: rgba(0,232,122,0.4);
  color: #00e87a;
}

/* ── SETTINGS PANEL ── */
#settings-panel {
  position: fixed; inset: 0;
  z-index: 9400;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.92);
}
#settings-panel.hidden { display: none; }

#settings-content {
  width: min(420px, 88vw);
  background: linear-gradient(145deg, #0c1422 0%, #080e1c 100%);
  border: 1px solid #1a2840;
  padding: 32px 36px;
  clip-path: polygon(14px 0%, 100% 0%, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0% 100%, 0% 14px);
  box-shadow: 0 0 60px rgba(0,100,200,0.06);
}
#settings-header {
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid #131e30; padding-bottom: 14px; margin-bottom: 20px;
}
#settings-title {
  font-family: 'Orbitron', monospace; font-size: 0.68rem; font-weight: 900;
  letter-spacing: 0.28em; color: #00e87a;
}
#ig-settings-close {
  background: none; border: none; color: #445577;
  cursor: pointer; font-size: 1rem; font-family: monospace; padding: 0 4px;
  transition: color 0.15s;
}
#ig-settings-close:hover { color: #00e87a; }
#settings-section-label {
  font-family: 'Orbitron', monospace; font-size: 0.52rem;
  letter-spacing: 0.25em; color: #2a3a52; text-transform: uppercase;
  margin-bottom: 12px;
}
#keys-rebind { display: flex; flex-direction: column; }

/* ── LEVEL SELECT PANEL ── */
#level-select-panel {
  position: fixed; inset: 0;
  z-index: 9400;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.92);
}
#level-select-panel.hidden { display: none; }

#level-select-content {
  width: min(440px, 88vw);
  background: linear-gradient(145deg, #0c1422 0%, #080e1c 100%);
  border: 1px solid #1a2840;
  padding: 32px 36px;
  clip-path: polygon(14px 0%, 100% 0%, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0% 100%, 0% 14px);
  box-shadow: 0 0 60px rgba(0,100,200,0.06);
}
#level-select-header {
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid #131e30; padding-bottom: 14px; margin-bottom: 8px;
}
#level-select-title {
  font-family: 'Orbitron', monospace; font-size: 0.68rem; font-weight: 900;
  letter-spacing: 0.28em; color: #00e87a;
}
#level-select-close {
  background: none; border: none; color: #445577;
  cursor: pointer; font-size: 1rem; font-family: monospace; padding: 0 4px;
  transition: color 0.15s;
}
#level-select-close:hover { color: #00e87a; }
#level-select-sub {
  font-size: 0.65rem; color: #253040; letter-spacing: 0.1em;
  margin-bottom: 18px;
}
#level-select-grid {
  display: flex; flex-direction: column; gap: 8px;
}
  `;
  
  document.head.appendChild(styleEl);
}

// Inject CSS when module loads
injectHeistCSS();

// ─── GRID CONSTANTS ──────────────────────────────────────────
export const CELL = 32;
export const COLS = 22;
export const ROWS = 16;
export const W    = COLS * CELL;
export const H    = ROWS * CELL;

// ─── LEVEL REGISTRY ──────────────────────────────────────────
export const LEVELS = [];
export function registerLevel(levelData) { LEVELS.push(levelData); }

// ─── WALL UTILITIES ──────────────────────────────────────────
export function buildBorderWalls(cols, rows) {
  const w = [];
  for (let x = 0; x < cols; x++) { w.push({x,y:0}); w.push({x,y:rows-1}); }
  for (let y = 1; y < rows-1; y++) { w.push({x:0,y}); w.push({x:cols-1,y}); }
  return w;
}
export function rectWall(x, y, w, h) {
  const cells = [];
  for (let row = y; row < y+h; row++)
    for (let col = x; col < x+w; col++)
      cells.push({x:col, y:row});
  return cells;
}

// ─── SETTINGS ────────────────────────────────────────────────
const DEFAULT_KEYS = { up:'ArrowUp', down:'ArrowDown', left:'ArrowLeft', right:'ArrowRight' };
let settings = { ghostReplay:true, keys:{...DEFAULT_KEYS} };
function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('heist_settings')||'{}');
    if (s.ghostReplay !== undefined) settings.ghostReplay = s.ghostReplay;
    if (s.keys) settings.keys = {...DEFAULT_KEYS, ...s.keys};
  } catch(e) {}
}
function saveSettings() { localStorage.setItem('heist_settings', JSON.stringify(settings)); }

// ─── ENGINE STATE ────────────────────────────────────────────
let canvas, ctx;
let level = 0, deaths = 0;
let player, guards, gems, wallSet, wallBarriers, goalRect;
let dead = false, levelWon = false, deathTimer = 0, winFlash = 0;
let running = false, paused = false, t = 0;
let runStartTime = 0, pausedTimeAccum = 0, pauseStart = 0, timerActive = false;
let csQueue = [], csIndex = 0, csOnComplete = null, csTypeTimer = null;
let _introScenes = null;
let npc = null, leaderboard = null, currentRunScore = null;
let npcEntity = null;
let allGemsCollected = false;
let staticCanvas = null, staticCtx = null;
let inSettings = false;

// Ghost replay
let ghostFrames = [], bestGhostRun = null, ghostPlayback = [], ghostFrame = 0;
const GHOST_SAMPLE = 2;
function loadBestGhost() {
  try { bestGhostRun = JSON.parse(localStorage.getItem('heist_ghost')||'null'); } catch(e) { bestGhostRun=null; }
}
function saveBestGhost(frames) {
  try { localStorage.setItem('heist_ghost', JSON.stringify(frames)); } catch(e) {}
}

// Level select
let levelsUnlocked = 1;
function loadProgress() { levelsUnlocked = Math.max(1, parseInt(localStorage.getItem('heist_unlocked')||'1')); }
function saveProgress(lvl) {
  if (lvl+1 > levelsUnlocked) { levelsUnlocked=lvl+1; localStorage.setItem('heist_unlocked',String(levelsUnlocked)); }
}

// Bonus floor
let _bonusFloorActive = false;

// ─── WALL HELPERS ────────────────────────────────────────────
function buildWallSet(walls) { return new Set(walls.map(w=>`${w.x},${w.y}`)); }
function buildBarriers(walls) { return walls.map(w=>({x:w.x*CELL,y:w.y*CELL,width:CELL,height:CELL})); }
function isWall(x, y) { return wallSet && wallSet.has(`${Math.floor(x/CELL)},${Math.floor(y/CELL)}`); }

// ─── LINE OF SIGHT CHECK ─────────────────────────────────────
function hasLineOfSight(x0, y0, x1, y1) {
  const dx = x1 - x0, dy = y1 - y0;
  const steps = Math.max(Math.abs(dx), Math.abs(dy)) / (CELL * 0.5);
  const n = Math.ceil(steps) + 1;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const cx = Math.floor((x0 + dx*t) / CELL);
    const cy = Math.floor((y0 + dy*t) / CELL);
    if (wallSet && wallSet.has(`${cx},${cy}`)) return false;
  }
  return true;
}

// ─── GEM CLASS ───────────────────────────────────────────────
class Gem {
  constructor(data) {
    this.x=data.x; this.y=data.y; this.r=data.r||6;
    this.collected=false; this.cooldownUntil=0; this.color=data.color||'#00c8ff';
  }
  collect() { this.collected=true; this.cooldownUntil=performance.now()+200; updateHUD(); }
  checkCollision(px,py,pr) {
    if (this.collected||performance.now()<this.cooldownUntil) return false;
    const dx=px-this.x, dy=py-this.y;
    return (dx*dx+dy*dy)<(pr+this.r+2)*(pr+this.r+2);
  }
}

// ─── PLAYER ──────────────────────────────────────────────────
class PlayerController {
  constructor(data) {
    this.x=data.x; this.y=data.y; this.r=data.r||9;
    this.speed=3.2;
    this.vel={x:0,y:0}; this.keys={};
    this._kd=this._onKeyDown.bind(this);
    this._ku=this._onKeyUp.bind(this);
    window.addEventListener('keydown',this._kd);
    window.addEventListener('keyup',  this._ku);
  }
  _onKeyDown(e) { this.keys[e.key]=true; }
  _onKeyUp(e)   { this.keys[e.key]=false; }
  updateVelocity() {
    const k=this.keys, sk=settings.keys, s=this.speed;
    const up=k[sk.up]  ||k['w']||k['W'];
    const dn=k[sk.down]||k['s']||k['S'];
    const lt=k[sk.left]||k['a']||k['A'];
    const rt=k[sk.right]||k['d']||k['D'];
    this.vel.x = rt?s : lt?-s : 0;
    this.vel.y = dn?s : up?-s : 0;
    if (this.vel.x!==0&&this.vel.y!==0) { this.vel.x*=0.707; this.vel.y*=0.707; }
  }
  move() {
    const nx=this.x+this.vel.x, ny=this.y+this.vel.y;
    if (!isWall(nx,ny))     this.x=nx;
    if (!isWall(this.x,ny)) this.y=ny;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
    ctx.fillStyle='#00e87a'; ctx.fill();
  }
  destroy() {
    window.removeEventListener('keydown',this._kd);
    window.removeEventListener('keyup',  this._ku);
  }
}

// ─── STATIC LAYER ────────────────────────────────────────────
function buildStaticLayer() {
  if (!staticCanvas) {
    staticCanvas=document.createElement('canvas');
    staticCanvas.width=W; staticCanvas.height=H;
    staticCtx=staticCanvas.getContext('2d');
  }
  const sc=staticCtx;
  sc.fillStyle='#000'; sc.fillRect(0,0,W,H);
  sc.strokeStyle='rgba(20,40,80,0.35)'; sc.lineWidth=0.5;
  sc.beginPath();
  for (let x=0;x<=W;x+=CELL){sc.moveTo(x,0);sc.lineTo(x,H);}
  for (let y=0;y<=H;y+=CELL){sc.moveTo(0,y);sc.lineTo(W,y);}
  sc.stroke();
  sc.fillStyle='#0d1828';
  wallBarriers.forEach(b=>sc.fillRect(b.x,b.y,CELL,CELL));
  sc.strokeStyle='rgba(0,180,100,0.2)'; sc.lineWidth=1;
  wallBarriers.forEach(b=>sc.strokeRect(b.x+0.5,b.y+0.5,CELL-1,CELL-1));
}

// ─── LEVEL INIT ──────────────────────────────────────────────
function initLevel(idx) {
  const L=LEVELS[idx];
  wallSet      = buildWallSet(L.walls);
  wallBarriers = buildBarriers(L.walls);
  if (player) player.destroy();
  player   = new PlayerController({x:L.start.x*CELL+CELL/2, y:L.start.y*CELL+CELL/2});
  goalRect = {x:L.goal.x*CELL, y:L.goal.y*CELL, w:L.goal.w*CELL, h:L.goal.h*CELL};
  gems     = L.gems.map(g=>new Gem({x:g.x*CELL+CELL/2, y:g.y*CELL+CELL/2, r:g.r||6, color:g.color||'#00c8ff'}));
  guards   = L.guards.map(g=>{
    const spd = Math.sqrt((g.vx||0)*(g.vx||0)+(g.vy||0)*(g.vy||0));
    return {...g, r:g.r||10, alertMode:false, alertTimer:0, chasing:false, baseSpeed:spd||4.8};
  });
  dead=false; levelWon=false; deathTimer=0; winFlash=0; allGemsCollected=false;
  if (idx===0&&!timerActive) { runStartTime=Date.now(); pausedTimeAccum=0; timerActive=true; }
  document.getElementById('h-level').textContent=idx+1;
  document.getElementById('h-total').textContent=gems.length;
  npcEntity=idx===0?{x:10.5*CELL,y:10.5*CELL,r:8}:null;
  const hint=document.getElementById('npc-hint');
  if (hint) hint.classList.toggle('active',idx===0);
  if (npc) npc.reset();
  buildStaticLayer();
  updateHUD();
  ghostFrames=[]; ghostFrame=0;
  ghostPlayback=(settings.ghostReplay&&bestGhostRun&&bestGhostRun.level===idx)?bestGhostRun.frames:[];
}

function updateHUD() {
  document.getElementById('h-deaths').textContent=deaths;
  document.getElementById('h-gems').textContent  =gems.filter(g=>g.collected).length;
}

// ─── TIMER ───────────────────────────────────────────────────
export function formatTime(ms) {
  const s=Math.floor(ms/1000), m=Math.floor(s/60);
  return `${String(m).padStart(2,'0')}:${String(s%60).padStart(2,'0')}.${String(Math.floor((ms%1000)/10)).padStart(2,'0')}`;
}
function getElapsed() {
  if (!timerActive) return 0;
  return paused ? (pauseStart-runStartTime-pausedTimeAccum) : (Date.now()-runStartTime-pausedTimeAccum);
}

function drawTimer() {
  if (!timerActive) return;
  const str=formatTime(getElapsed());
  const pad=10,fw=9,tw=str.length*fw;
  const bx=W-tw-pad*2-10, by=10, bw=tw+pad*2, bh=24;
  ctx.fillStyle='rgba(6,10,20,0.75)'; ctx.fillRect(bx,by,bw,bh);
  ctx.fillStyle='rgba(0,232,122,0.5)'; ctx.fillRect(bx,by,bw,1);
  ctx.font='13px Orbitron,monospace';
  ctx.fillStyle=paused?'rgba(255,200,0,0.9)':'rgba(0,232,122,0.9)';
  ctx.textAlign='right';
  ctx.fillText(paused?'PAUSED':str, W-10, by+bh-6);
  ctx.textAlign='left';
}

// ─── GUARD VISION CONE ───────────────────────────────────────
function playerInCone(g) {
  if (!g._spd || g._spd === 0) return false;
  const dx=player.x-g.x, dy=player.y-g.y;
  const distSq=dx*dx+dy*dy;
  if (distSq > 80*80) return false;
  const dist = Math.sqrt(distSq);
  const dot = (g._cosA * dx + g._sinA * dy) / dist;
  if (dot < 0.904) return false;
  return hasLineOfSight(g.x, g.y, player.x, player.y);
}

// ─── DRAW ────────────────────────────────────────────────────
function drawGems() {
  const byColor={};
  gems.forEach(g=>{
    if (g.collected) return;
    (byColor[g.color]||(byColor[g.color]=[])).push(g);
  });
  for (const color in byColor) {
    ctx.beginPath();
    byColor[color].forEach(g=>{
      const r=g.r;
      ctx.moveTo(g.x,g.y-r*1.4); ctx.lineTo(g.x+r,g.y);
      ctx.lineTo(g.x,g.y+r*1.4); ctx.lineTo(g.x-r,g.y);
      ctx.closePath();
    });
    ctx.fillStyle=color; ctx.fill();
  }
}

function drawGoal() {
  if (allGemsCollected) {
    ctx.fillStyle='rgba(0,232,122,0.2)'; ctx.fillRect(goalRect.x,goalRect.y,goalRect.w,goalRect.h);
    ctx.strokeStyle='#00e87a'; ctx.lineWidth=1.5;
    ctx.strokeRect(goalRect.x+0.5,goalRect.y+0.5,goalRect.w-1,goalRect.h-1);
    ctx.font='bold 14px Orbitron,monospace'; ctx.fillStyle='#00e87a';
    ctx.textAlign='center';
    ctx.fillText('EXTRACT',goalRect.x+goalRect.w/2,goalRect.y+goalRect.h/2+6);
    ctx.textAlign='left';
  } else {
    ctx.fillStyle='rgba(0,232,122,0.03)'; ctx.fillRect(goalRect.x,goalRect.y,goalRect.w,goalRect.h);
    ctx.strokeStyle='rgba(0,232,122,0.15)'; ctx.lineWidth=1;
    ctx.strokeRect(goalRect.x+0.5,goalRect.y+0.5,goalRect.w-1,goalRect.h-1);
  }
}

function drawGuardCone(g) {
  if (!g._spd || g._spd === 0) return;
  const coneLen=80, coneHalf=0.44;
  const cosL=Math.cos(g._angle-coneHalf), sinL=Math.sin(g._angle-coneHalf);
  const cosR=Math.cos(g._angle+coneHalf), sinR=Math.sin(g._angle+coneHalf);
  ctx.beginPath();
  ctx.moveTo(g.x, g.y);
  ctx.lineTo(g.x + cosL*coneLen, g.y + sinL*coneLen);
  ctx.lineTo(g.x + cosR*coneLen, g.y + sinR*coneLen);
  ctx.closePath();
  ctx.fillStyle = g.alertMode ? 'rgba(255,140,0,0.25)' : 'rgba(255,60,60,0.1)';
  ctx.fill();
}

function drawGuards() {
  if (!guards.length) return;
  guards.forEach(g=>drawGuardCone(g));
  guards.forEach(g=>{
    if (!g.alertMode) return;
    ctx.font='bold 10px Orbitron,monospace';
    ctx.fillStyle='#ff8800';
    ctx.textAlign='center';
    ctx.fillText('!',g.x,g.y-g.r-5);
    ctx.textAlign='left';
  });
  ctx.beginPath();
  guards.forEach(g=>{ ctx.moveTo(g.x+g.r,g.y); ctx.arc(g.x,g.y,g.r,0,Math.PI*2); });
  ctx.fillStyle='#cc2244'; ctx.fill();
}

function drawGhostReplay() {
  if (!settings.ghostReplay||!ghostPlayback.length) return;
  const pos=ghostPlayback[Math.min(Math.floor(ghostFrame/GHOST_SAMPLE),ghostPlayback.length-1)];
  if (!pos) return;
  ctx.globalAlpha=0.28;
  ctx.beginPath(); ctx.arc(pos.x,pos.y,9,0,Math.PI*2);
  ctx.fillStyle='#00e87a'; ctx.fill();
  ctx.globalAlpha=1;
}

function drawNPC() {
  if (!npcEntity) return;
  ctx.beginPath(); ctx.arc(npcEntity.x,npcEntity.y,npcEntity.r,0,Math.PI*2);
  ctx.fillStyle='#ffaa00'; ctx.fill();
  ctx.strokeStyle='#cc8800'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.font='bold 11px Arial'; ctx.fillStyle='#0a0e1a';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('?',npcEntity.x,npcEntity.y+0.5);
  ctx.textBaseline='alphabetic'; ctx.textAlign='left';
  if (player) {
    const dx=player.x-npcEntity.x, dy=player.y-npcEntity.y;
    if (dx*dx+dy*dy<52*52) {
      ctx.font='8px "Share Tech Mono"'; ctx.fillStyle='#ffaa00';
      ctx.textAlign='center';
      ctx.fillText('[E] CHAT',npcEntity.x,npcEntity.y-npcEntity.r-8);
      ctx.textAlign='left';
    }
  }
}

function draw() {
  ctx.drawImage(staticCanvas,0,0);
  drawGoal(); drawGems(); drawGuards(); drawGhostReplay(); drawNPC();
  if (player) player.draw();
  if (levelWon&&winFlash>0) {
    ctx.fillStyle=`rgba(0,232,122,${(winFlash/70)*0.25})`;
    ctx.fillRect(0,0,W,H); winFlash--;
  }
  if (dead&&deathTimer>0) {
    ctx.fillStyle=`rgba(200,0,40,${(deathTimer/70)*0.45})`;
    ctx.fillRect(0,0,W,H); deathTimer--;
    if (deathTimer===0) { initLevel(level); dead=false; }
  }
  drawTimer();
}

// ─── GUARDS ──────────────────────────────────────────────────
const ALERT_FRAMES = 90;

function guardWallHit(gx,gy,gr) {
  const r=gr-1;
  return (
    wallSet.has(`${Math.floor((gx-r)/CELL)},${Math.floor(gy/CELL)}`)||
    wallSet.has(`${Math.floor((gx+r)/CELL)},${Math.floor(gy/CELL)}`)||
    wallSet.has(`${Math.floor(gx/CELL)},${Math.floor((gy-r)/CELL)}`)||
    wallSet.has(`${Math.floor(gx/CELL)},${Math.floor((gy+r)/CELL)}`)
  );
}

function moveGuards() {
  if (levelWon) return;
  guards.forEach(g=>{
    if (!g.vx) g.vx=0; if (!g.vy) g.vy=0;
    const spd = Math.sqrt(g.vx*g.vx + g.vy*g.vy);
    g._spd   = spd;
    g._angle = (spd > 0) ? Math.atan2(g.vy, g.vx) : g._angle || 0;
    g._cosA  = Math.cos(g._angle);
    g._sinA  = Math.sin(g._angle);
    const seesPlayer = playerInCone(g);
    if (seesPlayer) {
      if (!g.alertMode) { g.alertMode=true; g.alertTimer=ALERT_FRAMES; }
      if (g.bounce) {
        g.chasing=true;
        const dx=player.x-g.x, dy=player.y-g.y;
        const dist=Math.sqrt(dx*dx+dy*dy)||1;
        const chaseSpeed=g.baseSpeed*1.5;
        g.vx=(dx/dist)*chaseSpeed;
        g.vy=(dy/dist)*chaseSpeed;
      }
    } else {
      if (g.alertTimer>0) {
        g.alertTimer--;
        if (g.alertTimer===0) {
          g.alertMode=false;
          if (g.bounce&&g.chasing) {
            g.chasing=false;
            const diag=g.baseSpeed*0.707;
            g.vx=diag; g.vy=diag;
          }
        }
      }
    }
    const nx=g.x+g.vx, ny=g.y+g.vy;
    if (!guardWallHit(nx,g.y,g.r)) g.x=nx; else { g.vx*=-1; }
    if (!guardWallHit(g.x,ny,g.r)) g.y=ny; else { g.vy*=-1; }
    if (g.x<g.r){g.x=g.r;g.vx=Math.abs(g.vx);}
    if (g.x>W-g.r){g.x=W-g.r;g.vx=-Math.abs(g.vx);}
    if (g.y<g.r){g.y=g.r;g.vy=Math.abs(g.vy);}
    if (g.y>H-g.r){g.y=H-g.r;g.vy=-Math.abs(g.vy);}
  });
}

// ─── COLLISIONS ──────────────────────────────────────────────
function checkCollisions() {
  if (dead||levelWon) return;
  const pr=player.r, px=player.x, py=player.y;
  for (const g of guards) {
    const dx=px-g.x, dy=py-g.y;
    if (dx*dx+dy*dy<(pr+g.r)*(pr+g.r)) { die(); return; }
  }
  if (!allGemsCollected) {
    let allDone=true;
    for (const gem of gems) {
      if (!gem.collected) {
        if (gem.checkCollision(px,py,pr)) gem.collect();
        if (!gem.collected) allDone=false;
      }
    }
    if (allDone) allGemsCollected=true;
  }
  if (allGemsCollected&&px>goalRect.x&&px<goalRect.x+goalRect.w&&py>goalRect.y&&py<goalRect.y+goalRect.h) {
    winLevel();
  }
}

function die() {
  if (dead) return;
  dead=true; deaths++; deathTimer=70;
  guards.forEach(g=>{ g.alertMode=false; g.alertTimer=0; g.chasing=false; });
  updateHUD();
}

// ─── WIN LEVEL ───────────────────────────────────────────────
function winLevel() {
  if (levelWon) return;
  levelWon=true; winFlash=40; running=false;
  saveProgress(level);
  if (settings.ghostReplay&&ghostFrames.length>0) {
    const prev=bestGhostRun;
    if (!prev||prev.level!==level||ghostFrames.length<prev.frames.length) {
      bestGhostRun={level,frames:ghostFrames.slice()};
      saveBestGhost(bestGhostRun);
    }
  }
  const mg=level;
  setTimeout(()=>{ mg<3?runMinigame(mg,finishLevel):finishLevel(); },800);
}

function finishLevel() {
  level++;
  if (level>=LEVELS.length) showBonusFloorPrompt();
  else { initLevel(level); running=true; loop(); }
}

// ─── PROCEDURAL BONUS FLOOR ──────────────────────────────────
function showBonusFloorPrompt() {
  const el=document.createElement('div');
  el.id='bonus-prompt';
  el.style.cssText=`position:fixed;inset:0;z-index:9400;background:rgba(0,0,0,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Share Tech Mono',monospace;color:#99b0cc;gap:16px;`;
  el.innerHTML=`
    <div style="font-family:'Orbitron',monospace;font-size:0.7rem;font-weight:900;letter-spacing:0.35em;color:#ffcc00;">// BONUS FLOOR DETECTED</div>
    <div style="font-size:0.82rem;color:#445577;text-align:center;line-height:1.8;">An uncharted server room has been found.<br>No guards. High risk. Score multiplier: <span style="color:#ffcc00">×1.5</span></div>
    <div style="display:flex;gap:16px;">
      <button id="bonus-yes" style="padding:10px 28px;font-family:'Orbitron',monospace;font-size:0.7rem;letter-spacing:0.2em;background:transparent;border:1px solid rgba(255,200,0,0.4);color:#ffcc00;cursor:pointer;">[ ENTER ]</button>
      <button id="bonus-no"  style="padding:10px 28px;font-family:'Orbitron',monospace;font-size:0.7rem;letter-spacing:0.2em;background:transparent;border:1px solid rgba(100,100,100,0.4);color:#445577;cursor:pointer;">[ SKIP ]</button>
    </div>`;
  document.getElementById('heist-shell').appendChild(el);
  document.getElementById('bonus-yes').onclick=()=>{ el.remove(); startBonusFloor(); };
  document.getElementById('bonus-no').onclick =()=>{ el.remove(); showEndScreen(); };
}

function startBonusFloor() {
  const rng=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
  const walls=buildBorderWalls(COLS,ROWS);
  for (let i=0;i<rng(3,5);i++) {
    const bx=rng(2,COLS-5),by=rng(2,ROWS-5),bw=rng(2,4),bh=rng(1,3);
    for (let r=by;r<by+bh;r++) for (let c=bx;c<bx+bw;c++) walls.push({x:c,y:r});
  }
  const ws=new Set(walls.map(w=>`${w.x},${w.y}`));
  const gemList=[], colors=['#00c8ff','#ff00cc','#ffcc00'];
  for (let a=0;a<40&&gemList.length<16;a++) {
    const gx=rng(1,COLS-2),gy=rng(1,ROWS-2);
    if (!ws.has(`${gx},${gy}`)) gemList.push({x:gx,y:gy,color:colors[gemList.length%3]});
  }
  LEVELS.push({walls, start:{x:1,y:7}, goal:{x:COLS-3,y:ROWS/2-1,w:2,h:2}, gems:gemList, guards:[], _isBonus:true});
  _bonusFloorActive=true;
  initLevel(LEVELS.length-1); running=true; loop();
}

// ─── LOOP ────────────────────────────────────────────────────
function loop() {
  if (!running) return;
  t++;
  player.updateVelocity(); player.move();
  moveGuards(); checkCollisions();
  if (settings.ghostReplay&&t%GHOST_SAMPLE===0) ghostFrames.push({x:player.x,y:player.y});
  ghostFrame++;
  draw();
  requestAnimationFrame(loop);
}

// ─── SETTINGS PANEL ──────────────────────────────────────────
function openSettings() {
  if (inSettings) return;
  inSettings=true;
  if (running) { paused=true; pauseStart=Date.now(); running=false; }
  document.getElementById('settings-panel')?.classList.remove('hidden');
  refreshSettingsUI();
}
function closeSettings() {
  inSettings=false;
  document.getElementById('settings-panel')?.classList.add('hidden');
  saveSettings();
  if (paused) { paused=false; pausedTimeAccum+=Date.now()-pauseStart; running=true; loop(); }
}
function refreshSettingsUI() {
  const kr=document.getElementById('keys-rebind'); if (!kr) return;
  kr.innerHTML='';
  const actions=[['up','Move Up'],['down','Move Down'],['left','Move Left'],['right','Move Right']];
  actions.forEach(([action,label])=>{
    const row=document.createElement('div');
    row.style.cssText='display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);';
    const lbl=document.createElement('span');
    lbl.style.cssText='font-size:0.75rem;color:#445577;letter-spacing:0.1em;';
    lbl.textContent=label;
    const btn=document.createElement('button');
    btn.style.cssText='font-family:"Share Tech Mono",monospace;font-size:0.78rem;background:rgba(0,20,10,0.6);border:1px solid rgba(0,232,122,0.2);color:#00e87a;padding:4px 14px;cursor:pointer;min-width:100px;text-align:center;';
    btn.textContent=settings.keys[action];
    btn.addEventListener('click',()=>startRebind(action,btn));
    row.appendChild(lbl); row.appendChild(btn); kr.appendChild(row);
  });
  const ghostRow=document.createElement('div');
  ghostRow.style.cssText='display:flex;justify-content:space-between;align-items:center;padding:10px 0 4px;';
  ghostRow.innerHTML=`<span style="font-size:0.75rem;color:#445577;letter-spacing:0.1em;">Ghost Replay</span><button id="ghost-toggle" style="font-family:'Orbitron',monospace;font-size:0.65rem;letter-spacing:0.15em;padding:5px 16px;cursor:pointer;border:1px solid;background:transparent;">${settings.ghostReplay?'ON':'OFF'}</button>`;
  kr.appendChild(ghostRow);
  const gt=document.getElementById('ghost-toggle');
  gt.style.color=settings.ghostReplay?'#00e87a':'#445577';
  gt.style.borderColor=settings.ghostReplay?'rgba(0,232,122,0.4)':'rgba(100,100,100,0.3)';
  gt.addEventListener('click',()=>{
    settings.ghostReplay=!settings.ghostReplay;
    gt.textContent=settings.ghostReplay?'ON':'OFF';
    gt.style.color=settings.ghostReplay?'#00e87a':'#445577';
    gt.style.borderColor=settings.ghostReplay?'rgba(0,232,122,0.4)':'rgba(100,100,100,0.3)';
    saveSettings();
  });
  const resetRow=document.createElement('div');
  resetRow.style.cssText='padding-top:12px;text-align:right;';
  resetRow.innerHTML=`<button id="reset-keys-btn" style="font-family:'Orbitron',monospace;font-size:0.58rem;letter-spacing:0.15em;padding:5px 14px;cursor:pointer;background:transparent;border:1px solid rgba(255,50,50,0.25);color:rgba(255,80,80,0.5);">RESET TO DEFAULTS</button>`;
  kr.appendChild(resetRow);
  document.getElementById('reset-keys-btn').addEventListener('click',()=>{ settings.keys={...DEFAULT_KEYS}; saveSettings(); refreshSettingsUI(); });
}
function startRebind(action,btn) {
  btn.textContent='PRESS A KEY...'; btn.style.color='#ffcc00'; btn.style.borderColor='rgba(255,200,0,0.4)';
  const handler=(e)=>{
    e.preventDefault(); e.stopPropagation();
    if (e.key==='Escape') { refreshSettingsUI(); window.removeEventListener('keydown',handler,true); return; }
    settings.keys[action]=e.key; saveSettings(); refreshSettingsUI();
    window.removeEventListener('keydown',handler,true);
  };
  window.addEventListener('keydown',handler,true);
}

// ─── LEVEL SELECT ────────────────────────────────────────────
function buildLevelSelectUI() {
  const grid=document.getElementById('level-select-grid'); if (!grid) return;
  grid.innerHTML='';
  const labels=['THE LOBBY','SECURITY HUB','VAULT ANTECHAMBER','THE VAULT CORE'];
  for (let i=0;i<4;i++) {
    const unlocked=i<levelsUnlocked;
    const btn=document.createElement('button');
    btn.style.cssText=`padding:12px 20px;font-family:'Orbitron',monospace;font-size:0.6rem;letter-spacing:0.15em;text-align:left;cursor:${unlocked?'pointer':'default'};background:transparent;border:1px solid ${unlocked?'rgba(0,232,122,0.3)':'rgba(50,70,90,0.3)'};color:${unlocked?'#00e87a':'#253040'};transition:background 0.15s;width:100%;`;
    btn.innerHTML=`<div>FLOOR ${i+1}</div><div style="font-size:0.5rem;color:${unlocked?'#445577':'#1a2535'};margin-top:3px;">${labels[i]}</div>`;
    if (unlocked) {
      btn.addEventListener('mouseenter',()=>btn.style.background='rgba(0,232,122,0.07)');
      btn.addEventListener('mouseleave',()=>btn.style.background='transparent');
      btn.addEventListener('click',()=>{
        document.getElementById('level-select-panel').classList.add('hidden');
        document.getElementById('overlay').classList.add('hidden');
        level=i; deaths=0; timerActive=false; pausedTimeAccum=0;
        runStartTime=Date.now(); timerActive=true;
        initLevel(i); running=true; loop();
      });
    }
    grid.appendChild(btn);
  }
}

// ─── CUTSCENE (typewriter) ───────────────────────────────────
export function showCutscene(scenes, onComplete) {
  csQueue=scenes; csIndex=0; csOnComplete=onComplete;
  document.getElementById('cutscene').classList.remove('hidden','fade-out');
  renderCutsceneSlide();
}
function renderCutsceneSlide() {
  const scene=csQueue[csIndex];
  document.getElementById('cs-label').textContent   = scene.label;
  document.getElementById('cs-counter').textContent = `${csIndex+1} / ${csQueue.length}`;
  document.getElementById('cs-btn').textContent     = csIndex===csQueue.length-1?'[ EXECUTE ]':'[ CONTINUE ]';
  const textEl=document.getElementById('cs-text');
  textEl.innerHTML='';
  const plain=scene.text.replace(/<[^>]+>/g,'');
  let i=0;
  if (csTypeTimer) clearInterval(csTypeTimer);
  csTypeTimer=setInterval(()=>{
    if (i>=plain.length) { clearInterval(csTypeTimer); csTypeTimer=null; textEl.innerHTML=scene.text; return; }
    textEl.textContent+=plain[i++];
  },16);
}
function bindCutsceneBtn() {
  document.getElementById('cs-btn').addEventListener('click',()=>{
    if (csTypeTimer) { clearInterval(csTypeTimer); csTypeTimer=null; document.getElementById('cs-text').innerHTML=csQueue[csIndex].text; return; }
    csIndex++;
    if (csIndex<csQueue.length) renderCutsceneSlide();
    else {
      document.getElementById('cutscene').classList.add('fade-out');
      setTimeout(()=>{ document.getElementById('cutscene').classList.add('hidden'); if (csOnComplete) csOnComplete(); },600);
    }
  });
}

// ─── END SCREEN ──────────────────────────────────────────────
export function showEndScreen() {
  const totalMs = getElapsed();
  timerActive = false; running = false;
  const displayMs=_bonusFloorActive?Math.round(totalMs/1.5):totalMs;
  document.getElementById('end-time').textContent  =formatTime(displayMs);
  document.getElementById('end-deaths').textContent=String(deaths);
  document.getElementById('canvas-wrap').style.display='none';
  document.getElementById('end-screen').classList.remove('hidden');
  currentRunScore=leaderboard.addScore('temp_player',displayMs,deaths);
  renderLeaderboard(currentRunScore);
  _bonusFloorActive=false;
  document.getElementById('end-play-again').onclick=()=>{
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('canvas-wrap').style.display='';
    if (LEVELS[LEVELS.length-1]?._isBonus) LEVELS.pop();
    level=0; deaths=0; timerActive=false; pausedTimeAccum=0; currentRunScore=null;
    initLevel(0); running=true; loop();
  };
}

// ─── LEADERBOARD ─────────────────────────────────────────────
function escapeHtml(t) { const d=document.createElement('div');d.textContent=t;return d.innerHTML; }
function renderLeaderboard(currentScore) {
  const topScores=leaderboard.getTop5();
  const tbody=document.querySelector('#leaderboard-table tbody');
  tbody.innerHTML='';
  if (!topScores.length) { const r=document.createElement('tr'); r.innerHTML='<td colspan="4" id="leaderboard-empty">No scores yet.</td>'; tbody.appendChild(r); return; }
  topScores.forEach((score,i)=>{
    const row=document.createElement('tr');
    if (currentScore&&score.id===currentScore.id) row.classList.add('current-player');
    row.innerHTML=`<td class="rank">#${i+1}</td><td class="name">${escapeHtml(score.name)}</td><td class="time">${formatTime(score.time)}</td><td class="deaths">${score.deaths}</td>`;
    tbody.appendChild(row);
  });
}
function bindLeaderboardInput() {
  const saveBtn=document.getElementById('save-name-btn');
  const nameEl =document.getElementById('player-name-input');
  const wipeBtn=document.getElementById('wipe-leaderboard-btn');
  saveBtn.addEventListener('click',()=>{
    const name=nameEl.value.trim()||'Anonymous';
    if (currentRunScore) {
      currentRunScore.name=name;
      leaderboard.entries=leaderboard.entries.map(e=>e.id===currentRunScore.id?currentRunScore:e);
      leaderboard.saveLeaderboard(); renderLeaderboard(currentRunScore); nameEl.value='';
    }
  });
  nameEl.addEventListener('keypress',e=>{if(e.key==='Enter')saveBtn.click();});
  if (wipeBtn) wipeBtn.addEventListener('click',()=>{ if(confirm('Wipe all scores?')){ leaderboard.clear(); currentRunScore=null; renderLeaderboard(null); } });
}

// ─── NPC ─────────────────────────────────────────────────────
function bindNPCSystem() {
  document.addEventListener('keydown',e=>{
    if ((e.key==='e'||e.key==='E')&&running&&level===0&&npcEntity) {
      const dx=player.x-npcEntity.x, dy=player.y-npcEntity.y;
      if (dx*dx+dy*dy<50*50) toggleNPCChat();
    }
  });
  document.getElementById('npc-send-btn').addEventListener('click',sendNPCMessage);
  document.getElementById('npc-input').addEventListener('keypress',e=>{if(e.key==='Enter')sendNPCMessage();});
  document.getElementById('npc-close-btn').addEventListener('click',closeNPCChat);
}
function toggleNPCChat() {
  const modal=document.getElementById('npc-modal');
  modal.classList.toggle('active');
  if (modal.classList.contains('active')) { document.getElementById('npc-input').focus(); running=false; }
  else { running=true; loop(); }
}
function closeNPCChat() { document.getElementById('npc-modal').classList.remove('active'); running=true; loop(); }
function sendNPCMessage() {
  const input=document.getElementById('npc-input');
  const text=input.value.trim(); if (!text) return;
  npc.addMessage('user',text); displayNPCMsg('user',text); input.value='';
  npc.getResponse(text).then(resp=>{ npc.addMessage('bot',resp); displayNPCMsg('bot',resp); });
  document.getElementById('npc-input').focus();
}
function displayNPCMsg(sender,text) {
  const c=document.getElementById('npc-messages');
  const d=document.createElement('div'); d.className=`npc-message ${sender}`;
  d.innerHTML=`<div class="npc-message-bubble">${escapeHtml(text)}</div>`;
  c.appendChild(d); c.scrollTop=c.scrollHeight;
}

// ─── PUBLIC API ──────────────────────────────────────────────
export function initGame({ canvasId, introScenes, onEndingCutscene }) {
  loadSettings(); loadProgress(); loadBestGhost();
  canvas=document.getElementById(canvasId); ctx=canvas.getContext('2d');
  canvas.width=W; canvas.height=H;
  _introScenes=introScenes;
  npc=initNPCSystem(); leaderboard=initLeaderboard();
  window._heistAddPenalty = (ms) => { runStartTime -= ms; };

  const wrap=document.getElementById('canvas-wrap');
  if (wrap&&!wrap.querySelector('.canvas-corner-tr')) {
    const tr=document.createElement('span'); tr.className='canvas-corner-tr';
    const bl=document.createElement('span'); bl.className='canvas-corner-bl';
    wrap.appendChild(tr); wrap.appendChild(bl);
  }
  const titleEl=document.getElementById('title');
  if (titleEl) titleEl.setAttribute('data-text',titleEl.textContent);

  bindCutsceneBtn(); bindNPCSystem(); bindLeaderboardInput();

  window.addEventListener('keydown',e=>{
    if (e.key==='Escape') { if (inSettings) closeSettings(); else if (running||paused) openSettings(); return; }
    if ((e.key==='z'||e.key==='Z')&&running&&!dead) { level++; if(level>=LEVELS.length) showEndScreen(); else initLevel(level); }
    if ((e.key==='r'||e.key==='R')&&running) {
      if (LEVELS[LEVELS.length-1]?._isBonus) LEVELS.pop();
      level=0; deaths=0; timerActive=false; pausedTimeAccum=0; currentRunScore=null; initLevel(0);
    }
  });

  document.getElementById('settings-btn')?.addEventListener('click',()=>{ document.getElementById('settings-panel').classList.remove('hidden'); refreshSettingsUI(); });
  document.getElementById('ig-settings-close')?.addEventListener('click',closeSettings);
  document.getElementById('level-select-btn')?.addEventListener('click',()=>{ buildLevelSelectUI(); document.getElementById('level-select-panel').classList.remove('hidden'); });
  document.getElementById('level-select-close')?.addEventListener('click',()=>{ document.getElementById('level-select-panel').classList.add('hidden'); });
}

export function startGame() {
  document.getElementById('overlay').classList.add('hidden');
  showCutscene(_introScenes,()=>{ initLevel(0); running=true; loop(); });
}
