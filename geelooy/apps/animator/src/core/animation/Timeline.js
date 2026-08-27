/* B”H */
export class Timeline {
  constructor() {
    this.startTime = Date.now();
    this.duration = 2000; // ms
    this.loop = true;
  }

  get progress() {
    const elapsed = Date.now() - this.startTime;
    const p = (elapsed % this.duration) / this.duration;
    return p;
  }

  // Flash-like easing (simple quadratic)
  static easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
}
