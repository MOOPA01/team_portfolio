---
layout: post
title: H.E.I.S.T.EXE
permalink: /gamify/heist
---

<link rel="stylesheet" href="{{site.baseurl}}/assets/js/heist/heist-game.css">

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
  </div>
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

<script type="module">
  import { initGame, startGame }  from '{{site.baseurl}}/assets/js/heist/heist-core.js';
  import { INTRO_SCENES }         from '{{site.baseurl}}/assets/js/heist/heist-level-1.js';
  import '{{site.baseurl}}/assets/js/heist/heist-level-2.js';
  import '{{site.baseurl}}/assets/js/heist/heist-level-3.js';
  import { showEndingCutscene }   from '{{site.baseurl}}/assets/js/heist/heist-level-4.js';

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
