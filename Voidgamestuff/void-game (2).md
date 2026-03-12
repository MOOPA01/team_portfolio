---
layout: null
permalink: /game/
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>V.O.I.D.EXE</title>
  <!--
    V.O.I.D.EXE  —  void-game.md
    Place in Jekyll site ROOT. Access at: http://localhost:4000/game/

    File structure required:
      void-game.md
      assets/css/void-game.css
      assets/js/void-core.js
      assets/js/void-level-1.js  (includes startGame)
      assets/js/void-level-2.js
      assets/js/void-level-3.js
      assets/js/void-level-4.js  (includes showEndingCutscene)
  -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{{ '/assets/css/void-game.css' | relative_url }}">
</head>
<body>

  <div class="scanline"></div>

  <!-- Fullscreen toggle -->
  <button id="fullscreen-btn" title="Toggle fullscreen" onclick="toggleFullscreen()">
    <svg id="fs-icon-expand" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <polyline points="1,6 1,1 6,1"/><polyline points="14,1 19,1 19,6"/>
      <polyline points="1,14 1,19 6,19"/><polyline points="14,19 19,19 19,14"/>
    </svg>
    <svg id="fs-icon-compress" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="display:none">
      <polyline points="6,1 6,6 1,6"/><polyline points="14,6 19,6 14,1"/>
      <polyline points="1,14 6,14 6,19"/><polyline points="19,14 14,14 14,19"/>
    </svg>
  </button>

  <!-- Cutscene overlay (intro + outro) -->
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

  <!-- End screen -->
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

  <!-- Game -->
  <div id="wrapper">
    <div id="title">V.O.I.D.EXE</div>
    <div id="hud">
      <div class="hud-item">LEVEL  <span id="h-level">1</span></div>
      <div class="hud-item">DEATHS <span id="h-deaths">0</span></div>
      <div class="hud-item">COINS  <span id="h-coins">0</span>/<span id="h-total">0</span></div>
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
        <button id="start-btn" class="void-btn" onclick="startGame()">INITIALIZE</button>
        <div id="controls-hint">WASD / ARROW KEYS — MOVE &nbsp;|&nbsp; R — RESTART</div>
      </div>
    </div>
  </div>

  <!-- Script load order: core first, then levels 1–4 -->
  <script src="{{ '/assets/js/void-core.js'    | relative_url }}"></script>
  <script src="{{ '/assets/js/void-level-1.js' | relative_url }}"></script>
  <script src="{{ '/assets/js/void-level-2.js' | relative_url }}"></script>
  <script src="{{ '/assets/js/void-level-3.js' | relative_url }}"></script>
  <script src="{{ '/assets/js/void-level-4.js' | relative_url }}"></script>

  <script>
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      document.getElementById('fs-icon-expand').style.display   = 'none';
      document.getElementById('fs-icon-compress').style.display = '';
    } else {
      document.exitFullscreen();
      document.getElementById('fs-icon-expand').style.display   = '';
      document.getElementById('fs-icon-compress').style.display = 'none';
    }
  }
  document.addEventListener('fullscreenchange', () => {
    const inFs = !!document.fullscreenElement;
    document.getElementById('fs-icon-expand').style.display   = inFs ? 'none' : '';
    document.getElementById('fs-icon-compress').style.display = inFs ? '' : 'none';
  });
  </script>

</body>
</html>
