---
layout: opencs
title: V.O.I.D.EXE
permalink: /gamify/void
---

<link rel="stylesheet" href="{{ site.baseurl }}/Voidgamestuff/assets/css/void-game.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">

<div class="scanline"></div>

<button id="fullscreen-btn" title="Toggle fullscreen" onclick="voidToggleFullscreen()">
  <svg id="fs-icon-expand" viewBox="0 0 20 20" fill="none" stroke="#aaa" stroke-width="2" stroke-linecap="round">
    <polyline points="1,6 1,1 6,1"/><polyline points="14,1 19,1 19,6"/>
    <polyline points="1,14 1,19 6,19"/><polyline points="14,19 19,19 19,14"/>
  </svg>
  <svg id="fs-icon-compress" viewBox="0 0 20 20" fill="none" stroke="#aaa" stroke-width="2" stroke-linecap="round" style="display:none">
    <polyline points="6,1 6,6 1,6"/><polyline points="14,6 19,6 14,1"/>
    <polyline points="1,14 6,14 6,19"/><polyline points="19,14 14,14 14,19"/>
  </svg>
</button>

<div id="cutscene" class="hidden">
  <div id="cs-bg"></div>
  <div id="cs-content">
    <div id="cs-header">
      <span id="cs-title-tag">V.O.I.D.EXE</span>
      <span id="cs-counter"></span>
    </div>
    <div id="cs-label"></div>
    <div id="cs-text"></div>
    <button id="cs-btn">[ CONTINUE ]</button>
  </div>
</div>

<div id="end-screen" class="hidden">
  <div id="end-panel">
    <div id="end-title">// RUN COMPLETE</div>
    <div id="end-stats">
      <div class="end-stat">
        <div class="end-stat-label">Time</div>
        <div class="end-stat-value" id="end-time">—</div>
      </div>
      <div class="end-stat-divider"></div>
      <div class="end-stat">
        <div class="end-stat-label">Deaths</div>
        <div class="end-stat-value" id="end-deaths">—</div>
      </div>
    </div>
    <button id="end-play-again">Play Again</button>
  </div>
</div>

<div id="wrapper">
  <div id="title">V.O.I.D.EXE</div>
  <div id="hud">
    <div class="hud-item">LEVEL <span id="h-level">1</span></div>
    <div class="hud-item">DEATHS <span id="h-deaths">0</span></div>
    <div class="hud-item">COINS <span id="h-coins">0</span>/<span id="h-total">0</span></div>
  </div>
  <div id="canvas-wrap">
    <canvas id="c"></canvas>
    <div id="overlay">
      <div id="overlay-title" class="cyan">V.O.I.D.EXE</div>
      <div id="overlay-sub">
        Navigate the grid.<br>
        Collect all coins.<br>
        Reach the green zone.<br>
        Don't touch the red.
      </div>
      <button id="start-btn" class="void-btn">INITIALIZE</button>
      <div id="controls-hint">WASD / ARROW KEYS — MOVE &nbsp;|&nbsp; R — RESTART</div>
    </div>
  </div>
</div>

<script type="module">
  import { initGame, startGame }
    from '{{ site.baseurl }}/Voidgamestuff/assets/js/void-core.js';

  import { INTRO_SCENES }
    from '{{ site.baseurl }}/Voidgamestuff/assets/js/void-level-1.js';

  import '{{ site.baseurl }}/Voidgamestuff/assets/js/void-level-2.js';
  import '{{ site.baseurl }}/Voidgamestuff/assets/js/void-level-3.js';

  import { showEndingCutscene }
    from '{{ site.baseurl }}/Voidgamestuff/assets/js/void-level-4.js';

  initGame({
    canvasId:         'c',
    introScenes:      INTRO_SCENES,
    onEndingCutscene: showEndingCutscene,
  });

  document.getElementById('start-btn').addEventListener('click', startGame);

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
