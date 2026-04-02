---
layout: opencs
title: H.E.I.S.T.EXE
permalink: /gamify/heist
---

<link rel="stylesheet" href="{{site.baseurl}}/assets/js/GameEnginev1.1/heist/heist-game.css">
<link rel="stylesheet" href="{{site.baseurl}}/assets/js/GameEnginev1.1/heist/heist-npc.css">
<link rel="stylesheet" href="{{site.baseurl}}/assets/js/GameEnginev1.1/heist/heist-leaderboard.css">

<div id="heist-shell">

  <button id="fullscreen-btn" onclick="voidToggleFullscreen()" title="Toggle fullscreen">
    <svg viewBox="0 0 24 24" id="fs-icon-expand">
      <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
      <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
    <svg viewBox="0 0 24 24" id="fs-icon-compress" style="display:none">
      <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
      <line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>
    </svg>
  </button>

  <div id="wrapper">
    <div id="title">H.E.I.S.T.EXE</div>
    <div id="hud">
      <div class="hud-item">FLOOR <span id="h-level">1</span></div>
      <div class="hud-item">GEMS <span id="h-gems">0</span>/<span id="h-total">0</span></div>
      <div class="hud-item">CAUGHT <span id="h-deaths">0</span></div>
    </div>
    <div id="canvas-wrap">
      <canvas id="c"></canvas>
    </div>
  </div>

  <div id="overlay">
    <div id="overlay-title" class="green">H.E.I.S.T.EXE</div>
    <div id="overlay-sub">
      Ghost Protocol Active<br>
      Collect all gems. Reach the extraction point.<br>
      Avoid the guards.
    </div>
    <button class="void-btn" id="start-btn">[ BEGIN INFILTRATION ]</button>
    <div id="controls-hint">WASD / ARROW KEYS — MOVE &nbsp;|&nbsp; Z — SKIP LEVEL &nbsp;|&nbsp; R — RESTART RUN</div>
  </div>

  <div id="cutscene" class="hidden">
    <div id="cs-bg"></div>
    <div id="cs-content">
      <div id="cs-header">
        <div id="cs-title-tag">H.E.I.S.T.EXE</div>
        <div id="cs-counter">1 / 5</div>
      </div>
      <div id="cs-label"></div>
      <div id="cs-text"></div>
      <button id="cs-btn">[ CONTINUE ]</button>
    </div>
  </div>

  <!-- NPC Chat Modal -->
  <div id="npc-modal">
    <div id="npc-chat">
      <div id="npc-chat-header">
        <div id="npc-chat-title">SECURE CHANNEL</div>
        <button id="npc-close-btn">✕</button>
      </div>
      <div id="npc-messages"></div>
      <div id="npc-input-area">
        <input type="text" id="npc-input" placeholder="Type message...">
        <button id="npc-send-btn">SEND</button>
      </div>
    </div>
  </div>

  <!-- NPC Hint -->
  <div id="npc-hint" style="display: none;">Press E to chat with AI</div>

  <div id="end-screen" class="hidden">
    <div id="end-panel">
      <div id="end-title">Mission Complete</div>
      <div id="end-stats">
        <div class="end-stat">
          <div class="end-stat-label">Time</div>
          <div class="end-stat-value" id="end-time">00:00.00</div>
        </div>
        <div class="end-stat-divider"></div>
        <div class="end-stat">
          <div class="end-stat-label">Times Caught</div>
          <div class="end-stat-value" id="end-deaths">0</div>
        </div>
      </div>
      
      <!-- LEADERBOARD SECTION -->
      <div id="leaderboard-section">
        <div id="leaderboard-title">TOP TIMES</div>
        <div id="player-name-input-group">
          <input type="text" id="player-name-input" placeholder="Enter your name...">
          <button id="save-name-btn">SAVE</button>
        </div>
        <table id="leaderboard-table">
          <thead>
            <tr>
              <th class="rank">Rank</th>
              <th class="name">Player</th>
              <th class="time">Time</th>
              <th class="deaths">Caught</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      
      <button id="end-play-again">[ PLAY AGAIN ]</button>
    </div>
  </div>

</div>

<script type="module">
  // Set globals needed by level files before any imports run
  window._siteBaseUrl = '{{site.baseurl}}';

  import { pythonURI, javaURI, fetchOptions } from '{{site.baseurl}}/assets/js/api/config.js';
  window._pythonURI    = pythonURI;
  window._javaURI      = javaURI;
  window._fetchOptions = fetchOptions;
</script>
<script type="module">
  // Import GameEngine modules
  import { GameCore } from '{{site.baseurl}}/assets/js/GameEnginev1.1/essentials/Game.js';
  import GameControl from '{{site.baseurl}}/assets/js/GameEnginev1.1/essentials/GameControl.js';
  
  // Import level files FIRST to populate LEVELS array before HeistLevel is used
  import { INTRO_SCENES } from '{{site.baseurl}}/assets/js/GameEnginev1.1/heist/heist-level-1.js';
  import '{{site.baseurl}}/assets/js/GameEnginev1.1/heist/heist-level-2.js';
  import '{{site.baseurl}}/assets/js/GameEnginev1.1/heist/heist-level-3.js';
  import { showEndingCutscene }   from '{{site.baseurl}}/assets/js/GameEnginev1.1/heist/heist-level-4.js';
  import '{{site.baseurl}}/assets/js/GameEnginev1.1/heist/heist-npc.js';
  import '{{site.baseurl}}/assets/js/GameEnginev1.1/heist/heist-leaderboard.js';

  initGame({
    canvasId:         'c',
    introScenes:      INTRO_SCENES,
    onEndingCutscene: showEndingCutscene,
  });

  document.getElementById('start-btn').addEventListener('click', startGame);

  document.getElementById('end-play-again').addEventListener('click', () => {
    document.getElementById('end-screen').classList.add('hidden');
    startGame();
  });

  window.voidToggleFullscreen = function () {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      document.getElementById('fs-icon-expand').style.display  = 'none';
      document.getElementById('fs-icon-compress').style.display = '';
    } else {
      document.exitFullscreen();
      document.getElementById('fs-icon-expand').style.display  = '';
      document.getElementById('fs-icon-compress').style.display = 'none';
    }
  };

  document.addEventListener('fullscreenchange', () => {
    const inFs = !!document.fullscreenElement;
    document.getElementById('fs-icon-expand').style.display  = inFs ? 'none' : '';
    document.getElementById('fs-icon-compress').style.display = inFs ? '' : 'none';
  });
</script>