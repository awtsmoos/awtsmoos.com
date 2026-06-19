
/* B”H */

/**
 * @class PlaybackMaster
 * @description
 * The 'Klav' (Heartbeat) of the NLE. 
 * Centralizes playback control, ensuring audio tracks and visual 
 * keyframes are perfectly synchronized across the Seder Histalshelus.
 */
export class PlaybackMaster {
  constructor(app) {
    this.app = app;
    this.state = app.state;
  }

  toggle() {
    const isPlaying = !this.app.director.isPlaying;
    if (isPlaying) {
      this.app.director.play(this.state.get('activeSequence'));
    } else {
      this.app.director.stop();
    }
    return isPlaying;
  }

  seek(timeMs) {
    this.app.director.seek(timeMs);
  }

  stop() {
    this.app.director.stop();
    this.seek(0);
  }
}
