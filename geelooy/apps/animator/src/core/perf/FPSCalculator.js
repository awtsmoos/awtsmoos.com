
// B"H
export class FPSCalculator {
  static lastTime = 0;
  static frames = 0;
  static currentFps = 60;
  static currentMs = 16.6;
  static lastUpdate = 0;

  static tick(now) {
    if (!this.lastTime) this.lastTime = now;
    
    const delta = now - this.lastTime;
    this.currentMs = delta;
    this.lastTime = now;
    this.frames++;

    if (now - this.lastUpdate >= 500) {
      this.currentFps = Math.round((this.frames * 1000) / (now - this.lastUpdate));
      this.frames = 0;
      this.lastUpdate = now;
      this.needsUpdate = true;
    } else {
      this.needsUpdate = false;
    }
  }

  static shouldUpdateDOM() { return this.needsUpdate; }
  static getFPS() { return this.currentFps; }
  static getMsPerFrame() { return this.currentMs.toFixed(1); }
}
