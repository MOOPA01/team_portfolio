---
layout: post
permalink: /void/
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
      assets/js/void-level-1.js  (includes startGame + startSpeedrun)
      assets/js/void-level-2.js
      assets/js/void-level-3.js
      assets/js/void-level-4.js
      assets/js/void-level-5.js  (includes showEndingCutscene)
  -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{{ '/assets/css/void-game.css' | relative_url }}">
</head>
<body>

  <div class="scanline"></div>

  <!-- Fullscreen toggle button -->
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

  <!-- Speedrun results screen -->
  <div id="speedrun-results" class="hidden">
    <div id="sr-panel">
      <div id="sr-header">// RUN COMPLETE</div>
      <div id="sr-stats">
        <div class="sr-stat">
          <div class="sr-stat-label">Time</div>
          <div class="sr-stat-value" id="sr-run-time">—</div>
        </div>
        <div class="sr-stat">
          <div class="sr-stat-label">Best Time</div>
          <div class="sr-stat-value" id="sr-best-time">—</div>
        </div>
        <div class="sr-stat">
          <div class="sr-stat-label">Deaths</div>
          <div class="sr-stat-value" id="sr-run-deaths">—</div>
        </div>
        <div class="sr-stat">
          <div class="sr-stat-label">Least Deaths</div>
          <div class="sr-stat-value" id="sr-best-deaths">—</div>
        </div>
      </div>
      <div id="sr-actions">
        <button id="sr-play-again">NORMAL MODE</button>
        <button id="sr-play-speedrun">&#9201; RETRY RUN</button>
      </div>
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
        <!-- startGame() defined in void-level-1.js -->
        <button id="start-btn" class="void-btn" onclick="startGame()">INITIALIZE</button>
        <!-- startSpeedrun() defined in void-level-1.js -->
        <button id="speedrun-btn" class="void-btn" onclick="startSpeedrun()">⏱ SPEEDRUN</button>
        <div id="controls-hint">WASD / ARROW KEYS — MOVE &nbsp;|&nbsp; R — RESTART</div>
        <div class="speedrun-hint">SPEEDRUN skips cutscenes and times your run</div>
      </div>
    </div>
  </div>

  <!-- Script load order: core first, then levels 1–5 in order -->
  <script src="{{ '/assets/js/void-core.js'    | relative_url }}"></script>
  <script src="{{ '/assets/js/void-level-1.js' | relative_url }}"></script>
  <script src="{{ '/assets/js/void-level-2.js' | relative_url }}"></script>
  <script src="{{ '/assets/js/void-level-3.js' | relative_url }}"></script>
  <script src="{{ '/assets/js/void-level-4.js' | relative_url }}"></script>

  <script>
  // ── FULLSCREEN ───────────────────────────────────────────────
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

  // ── SCROLL WITHOUT ARROW KEYS ────────────────────────────────
  // Arrow keys are captured by the game. Allow scrolling only via
  // mouse wheel / trackpad (which don't fire keydown events).
  // We do NOT call e.preventDefault() on wheel — browser handles it natively.
  // The only thing we suppress is keyboard-initiated scrolling (Space/Arrows),
  // which is already done in void-core.js keydown handler.
  </script>

</body>
</html>
