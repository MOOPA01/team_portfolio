// =============================================================
//  HeistLevel.js  —  GameEngine v1.1 Heist Level Integration
//  Implements the GameLevel interface for H.E.I.S.T.EXE game
// =============================================================

import { initGame, startGame } from './heist-game-combined.js';
import { INTRO_SCENES } from './heist-level-1.js';

/**
 * HeistLevel implements the GameLevel interface for integration with GameCore.
 * This allows the Heist game to run within the GameEngine framework.
 * 
 * Key Design:
 * - Heist is a legacy self-contained game with its own render loop
 * - We wrap it in the GameEngine's GameLevel interface
 * - We disable GameEngine's automatic canvas clear so Heist's loop controls rendering
 * - The heist-shell DOM must exist in heist.md for all UI elements
 */
class HeistLevel {
  constructor(gameEnv) {
    this.gameEnv = gameEnv;
    this.heistStarted = false;
    this.originalClear = null;
    this.createdCanvas = false;
    this.classes = [];
  }

  /**
   * Initialize the Heist game.
   * Assumes heist-shell DOM exists in heist.md.
   */
  initialize() {
    const shell = document.getElementById('heist-shell');
    if (!shell) {
      throw new Error('HeistLevel requires #heist-shell element in DOM');
    }

    let canvas = this.gameEnv?.gameCanvas || document.getElementById('gameCanvas') || document.getElementById('c');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'gameCanvas';
      shell.appendChild(canvas);
      this.createdCanvas = true;
    }

    if (!this.gameEnv) {
      throw new Error('HeistLevel requires a valid gameEnv instance');
    }

    this.gameEnv.gameCanvas = canvas;

    // Set canvas dimensions for heist
    canvas.width = 704;
    canvas.height = 512;

    if (typeof this.gameEnv.clear === 'function') {
      this.originalClear = this.gameEnv.clear.bind(this.gameEnv);
      this.gameEnv.clear = () => {};
    }

    initGame({
      canvasId: canvas.id,
      introScenes: INTRO_SCENES,
      onEndingCutscene: () => {},
    });

    startGame();
    this.heistStarted = true;
  }

  /**
   * Game update method - called each frame by GameEngine.
   * The legacy Heist game maintains its own loop, so we do nothing here.
   */
  update() {
    // no-op; Heist rendering is handled by the legacy internal loop.
  }

  /**
   * Cleanup when level is destroyed
   */
  destroy() {
    if (this.originalClear) {
      this.gameEnv.clear = this.originalClear;
      this.originalClear = null;
    }

    if (this.createdCanvas) {
      const canvas = document.getElementById('gameCanvas');
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      this.createdCanvas = false;
    }

    if (this.gameEnv && typeof this.gameEnv.destroy === 'function') {
      this.gameEnv.destroy();
    }
  }
}

export default HeistLevel;
