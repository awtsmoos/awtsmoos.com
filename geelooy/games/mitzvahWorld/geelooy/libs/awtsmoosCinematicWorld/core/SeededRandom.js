// B"H
/** SeededRandom: deterministic sparks from one hidden breath of the Awtsmoos. */
export class SeededRandom {
  constructor(seed = 770) { this.state = Number(seed) >>> 0 || 770; }
  next() { this.state = (1664525 * this.state + 1013904223) >>> 0; return this.state / 4294967296; }
  range(min, max) { return min + (max - min) * this.next(); }
  int(min, max) { return Math.floor(this.range(min, max + 1)); }
  choice(items) { return items[Math.min(items.length - 1, Math.floor(this.next() * items.length))]; }
  jitter(value, amount) { return value + this.range(-amount, amount); }
}
export function createSeededRandom(seed) { return new SeededRandom(seed); }
export default SeededRandom;
