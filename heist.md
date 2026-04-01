---
layout: opencs
title: H.E.I.S.T.EXE
permalink: /gamify/heist
---

<link rel="stylesheet" href="{{site.baseurl}}/assets/js/GameEnginev1.1/heist/heist-game.css">

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
      <button id="end-play-again">[ RUN AGAIN ]</button>
    </div>
  </div>

</div>

<script>window._siteBaseUrl = '{{site.baseurl}}';</script>
<script type="module">
  // Expose config globals for non-module NPC code in combined builds
  import { pythonURI, fetchOptions } from '{{site.baseurl}}/assets/js/api/config.js';
  window._pythonURI    = pythonURI;
  window._fetchOptions = fetchOptions;
</script>
<script type="module">
  import GameCore from '{{site.baseurl}}/assets/js/GameEnginev1.1/essentials/Game.js';
  import GameControl from '{{site.baseurl}}/assets/js/GameEnginev1.1/essentials/GameControl.js';
  import HeistLevel from '{{site.baseurl}}/assets/js/GameEnginev1.1/heist/HeistLevel.js';
  import { INTRO_SCENES } from '{{site.baseurl}}/assets/js/GameEnginev1.1/heist/heist-level-1.js';
  
  // Import all level data to register them
  import '{{site.baseurl}}/assets/js/GameEnginev1.1/heist/heist-level-2.js';
  import '{{site.baseurl}}/assets/js/GameEnginev1.1/heist/heist-level-3.js';
  import { showEndingCutscene } from '{{site.baseurl}}/assets/js/GameEnginev1.1/heist/heist-level-4.js';

  // Initialize GameEngine with Heist
  const environment = {
    path: '{{site.baseurl}}',
    gameContainer: document.getElementById('wrapper'),
    gameCanvas: document.getElementById('c'),
    gameLevelClasses: [HeistLevel],
    disablePauseMenu: true,
    disableContainerAdjustment: true,
    pythonURI: window._pythonURI,
    fetchOptions: window._fetchOptions,
  };

  // Create GameCore instance
  const gameCore = new GameCore(environment, GameControl);
  
  // Function to safely handle start button
  function handleStartButton() {
    const heist = window._heistGameInstance;
    if (!heist) {
      console.error('Game not initialized yet');
      return false;
    }
    document.getElementById('overlay').classList.add('hidden');
    heist.showCutscene(INTRO_SCENES, () => {
      heist.resetGame();
      heist.running = true;
    });
    return true;
  }
  
  // Setup button handlers with retry logic
  let startBtnRetries = 0;
  const setupButtonHandlers = () => {
    const heist = window._heistGameInstance;
    const startBtn = document.getElementById('start-btn');
    const endPlayAgainBtn = document.getElementById('end-play-again');
    
    if (!heist || !startBtn || !endPlayAgainBtn) {
      startBtnRetries++;
      if (startBtnRetries < 50) { // Retry for up to 5 seconds
        setTimeout(setupButtonHandlers, 100);
      } else {
        console.error('Failed to setup button handlers - game not initialized');
      }
      return;
    }
    
    // Configure heist instance
    heist._introScenes = INTRO_SCENES;
    heist._onEndingCutscene = showEndingCutscene;
    
    // Remove any previous listeners
    startBtn.replaceWith(startBtn.cloneNode(true));
    document.getElementById('end-play-again').replaceWith(endPlayAgainBtn.cloneNode(true));
    
    // Attach fresh listeners
    document.getElementById('start-btn').addEventListener('click', handleStartButton);
    document.getElementById('end-play-again').addEventListener('click', () => {
      const h = window._heistGameInstance;
      if (h) {
        document.getElementById('end-screen').classList.add('hidden');
        document.getElementById('canvas-wrap').style.display = '';
        h.resetGame();
        h.running = true;
      }
    });
    
    console.log('Game initialized and ready to play!');
  };
  
  // Start setup after a brief delay to allow GameCore initialization
  setTimeout(setupButtonHandlers, 200);

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
