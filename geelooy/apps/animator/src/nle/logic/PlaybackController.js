
/* B”H */

/**
 * @class PlaybackController
 * @description
 * The 'Ruach' (Wind/Movement) of the NLE. 
 * Orchestrates the Play/Pause/Stop cycles and communicates with the Director.
 */
export class PlaybackController {
  constructor(app) {
    this.app = app;
  }

  toggle() {
    if (this.app.director.isPlaying) {
      this.app.director.stop();
      return false;
    } else {
      this.app.director.play(this.app.state.get('activeSequence'));
      return true;
    }
  }

  stop() {
    this.app.director.stop();
    this.app.director.seek(0);
  }
}
