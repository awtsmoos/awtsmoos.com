
/* B”H */

/**
 * @class PlaybackEngine
 * @description
 * THE ANGEL OF CAUSALITY (Malach Ha-Manehig).
 * Handles time flowing and stopping.
 */
export class PlaybackEngine {
  constructor(appState, director) {
    this.state = appState;
    this.director = director;
  }

  get activeSequence() {
    return this.state.get('activeSequence');
  }

  get currentTime() {
    return this.state.get('director_time') || 0;
  }

  togglePlayback() {
    if (this.director.isPlaying) {
      this.director.stop();
      return false; 
    } else {
      const sequence = this.activeSequence;
      if (sequence) {
        // Resume from where we scrubbed to
        this.director.play(sequence, this.currentTime);
        return true; 
      }
      return false;
    }
  }

  stop() {
    this.director.stop();
  }

  seek(ms) {
    this.director.seek(ms);
    // Explicitly update the director so state reflects the exact seek moment, 
    // ensuring characters pose correctly even when paused.
    this.director.update(true); 
  }
}
