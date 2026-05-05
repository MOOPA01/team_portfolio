/*console.log("heist-music.js loaded from /assets/js/GameEnginev1.1/heist");

class heistMusic {
  constructor() {
    this.player = null;
    this.started = false;
    this.isPlaying = false;
    this.videoId = 'wZe-_boTWMk'; // Your specific video ID
    this.userActivated = false;
    
    this.createToggleButton();
    this.loadYouTubeAPI();
  }

  loadYouTubeAPI() {
    // Load the YouTube IFrame API script if it hasn't been loaded yet
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Create a hidden container for the video player
    const hiddenDiv = document.createElement('div');
    hiddenDiv.id = 'heist-player-container';
    hiddenDiv.style.display = 'none'; // Keep the video invisible
    document.body.appendChild(hiddenDiv);
  }

  createToggleButton() {
    const btn = document.createElement('button');
    btn.id = 'heist-music-toggle';
    btn.innerHTML = 'Music';
    btn.style.cssText = `
      position: fixed; top: 10px; right: 10px; z-index: 10000;
      padding: 8px 16px; font-size: 14px; font-family: sans-serif;
      background: #ff6b9d; color: white; border: none;
      border-radius: 20px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMusic();
    });

    document.body.appendChild(btn);
    this.toggleBtn = btn;
  }

  async initPlayer() {
    return new Promise((resolve) => {
      this.player = new YT.Player('heist-player-container', {
        height: '0',
        width: '0',
        videoId: this.videoId,
        playerVars: {
          'start': 0,
          'end': 58,
          'controls': 0,
          'disablekb': 1,
          'rel': 0
        },
        events: {
          'onReady': (event) => {
            event.target.setVolume(35);
            resolve();
          },
          'onStateChange': (event) => {
            // Logic to loop back to start when 58s is reached or video ends
            if (event.data === YT.PlayerState.ENDED) {
              this.player.seekTo(0);
              this.player.playVideo();
            }
          }
        }
      });
    });
  }

  async toggleMusic() {
    if (!this.started) {
      // First time click: Initialize and Play
      if (window.YT && window.YT.Player) {
        await this.initPlayer();
        this.player.playVideo();
        this.started = true;
        this.isPlaying = true;
      }
    } else if (this.isPlaying) {
      this.player.pauseVideo();
      this.isPlaying = false;
    } else {
      this.player.playVideo();
      this.isPlaying = true;
    }
    this.updateButton();
  }

  updateButton() {
    if (this.toggleBtn) {
      this.toggleBtn.innerHTML = this.isPlaying ? 'Music On' : 'Music Off';
    }
  }
}

export default heistMusic;

*/