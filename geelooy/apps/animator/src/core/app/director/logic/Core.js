/* B”H */
export class DirectorCore {
  constructor(app) {
    this.app = app;
    this.sequence = null;
    this.startTime = 0;
    this.isPlaying = false;
  }

  play(sequence) {
    this.sequence = sequence;
    this.startTime = performance.now();
    this.isPlaying = true;
    console.log('DirectorCore: Sequence started', sequence);
  }

  stop() {
    this.isPlaying = false;
  }

  getElapsed() {
    if (!this.isPlaying) return 0;
    return performance.now() - this.startTime;
  }
}
