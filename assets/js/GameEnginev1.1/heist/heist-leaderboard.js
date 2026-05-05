// =============================================================
//  H.E.I.S.T.EXE Leaderboard System (GameEngine v1.1)
// =============================================================

import Leaderboard from '../essentials/Leaderboard.js';

class HeistLeaderboard extends Leaderboard {
  constructor(gameControl, options = {}) {
    super(gameControl, {
      gameName: 'Heist',
      initiallyHidden: true,
      ...options
    });

    // Inject heist-specific CSS
    this.injectStyles();
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Leaderboard Panel */
      #leaderboard-section {
        margin-top: 24px;
        border-top: 1px solid rgba(0, 200, 120, 0.2);
        padding-top: 20px;
      }

      #leaderboard-title {
        color: #00e87a;
        font-size: 16px;
        font-weight: bold;
        letter-spacing: 2px;
        margin-bottom: 16px;
        text-align: center;
      }

      #player-name-input-group {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }

      #player-name-input {
        flex: 1;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(0, 200, 120, 0.3);
        border-radius: 4px;
        color: #00e87a;
        padding: 10px 12px;
        font-family: 'Share Tech Mono', monospace;
        font-size: 13px;
        outline: none;
        transition: border-color 0.2s;
      }

      #player-name-input:focus {
        border-color: #00e87a;
        box-shadow: 0 0 10px rgba(0, 200, 120, 0.2);
      }

      #player-name-input::placeholder {
        color: rgba(0, 200, 120, 0.4);
      }

      #save-name-btn {
        background: rgba(0, 200, 120, 0.2);
        border: 1px solid rgba(0, 200, 120, 0.4);
        color: #00e87a;
        padding: 10px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Share Tech Mono', monospace;
        font-size: 12px;
        font-weight: bold;
        transition: all 0.2s;
      }

      #save-name-btn:hover {
        background: rgba(0, 200, 120, 0.3);
        box-shadow: 0 0 10px rgba(0, 200, 120, 0.3);
      }

      #save-name-btn:active {
        transform: scale(0.95);
      }

      #leaderboard-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }

      #leaderboard-table thead {
        border-bottom: 2px solid rgba(0, 200, 120, 0.3);
      }

      #leaderboard-table th {
        color: rgba(0, 200, 120, 0.7);
        padding: 12px;
        text-align: left;
        font-weight: bold;
        letter-spacing: 1px;
      }

      #leaderboard-table td {
        padding: 12px;
        border-bottom: 1px solid rgba(0, 200, 120, 0.1);
        color: rgba(0, 200, 255, 0.85);
      }

      #leaderboard-table tr.current-player {
        background: rgba(0, 200, 120, 0.1);
        border-left: 3px solid #00e87a;
      }

      #leaderboard-table tr.current-player td {
        color: #00e87a;
        font-weight: bold;
      }

      #wipe-leaderboard-btn {
        background: rgba(200, 0, 40, 0.2);
        border: 1px solid rgba(200, 0, 40, 0.4);
        color: #ff4444;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Share Tech Mono', monospace;
        font-size: 11px;
        margin-top: 16px;
        transition: all 0.2s;
      }

      #wipe-leaderboard-btn:hover {
        background: rgba(200, 0, 40, 0.3);
        box-shadow: 0 0 10px rgba(200, 0, 40, 0.3);
      }
    `;
    document.head.appendChild(style);
  }

  // Override to use elementary mode for heist scores (time and deaths)
  setupElementaryMode() {
    super.setupElementaryMode();
    // Customize for heist: add deaths field
    this.addDeathsField();
  }

  addDeathsField() {
    // Add deaths input to the form
    const form = this.elementaryForm;
    if (form) {
      const deathsInput = document.createElement('input');
      deathsInput.type = 'number';
      deathsInput.id = 'deaths-input';
      deathsInput.placeholder = 'Deaths';
      deathsInput.min = '0';
      deathsInput.style.cssText = `
        width: 100%;
        padding: 8px;
        margin-bottom: 8px;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(0, 200, 120, 0.3);
        border-radius: 4px;
        color: #00e87a;
        font-family: 'Share Tech Mono', monospace;
        font-size: 13px;
        outline: none;
      `;
      form.insertBefore(deathsInput, form.querySelector('button'));
    }
  }

  // Override addElementaryScore to include deaths
  addElementaryScore() {
    const nameInput = document.getElementById('elementary-name');
    const scoreInput = document.getElementById('elementary-score');
    const deathsInput = document.getElementById('deaths-input');

    if (!nameInput || !scoreInput || !deathsInput) return;

    const name = nameInput.value.trim();
    const score = parseFloat(scoreInput.value);
    const deaths = parseInt(deathsInput.value) || 0;

    if (!name || isNaN(score)) return;

    // Submit as score with deaths in metadata
    this.submitScore(name, score, this.gameName, { deaths });

    nameInput.value = '';
    scoreInput.value = '';
    deathsInput.value = '';
  }

  // Override displayElementaryLeaderboard to show deaths
  displayElementaryLeaderboard(data) {
    const tbody = document.getElementById('elementary-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    data.forEach((entry, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${this.escape(entry.name)}</td>
        <td>${entry.score}</td>
        <td>${entry.metadata?.deaths || 0}</td>
        <td><button onclick="window.heistLeaderboard.deleteElementaryScore('${entry.id}')">Delete</button></td>
      `;
      tbody.appendChild(row);
    });
  }

  // Method to add heist score
  addHeistScore(playerName, timeMs, deaths) {
    this.submitScore(playerName, timeMs, this.gameName, { deaths });
  }

  // Method to get top scores
  getTopScores() {
    // Use the elementary leaderboard data
    return this.fetchElementaryLeaderboard().then(data => data.slice(0, 5));
  }

  // Method to clear leaderboard
  clearLeaderboard() {
    // Clear local storage for elementary mode
    localStorage.removeItem(`elementary_leaderboard_${this.gameName}`);
    this.fetchElementaryLeaderboard();
  }
}

export { HeistLeaderboard };

export function initLeaderboard() {
  return new Leaderboard();
}