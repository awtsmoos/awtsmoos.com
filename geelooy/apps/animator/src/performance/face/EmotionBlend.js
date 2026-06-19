// B"H
import { EmotionLibrary } from './EmotionLibrary.js';
export class EmotionBlend {
  static blend(base = 'calm', moment = null, amount = 0.45) {
    return this.mix(EmotionLibrary.get(base), moment ? EmotionLibrary.get(moment) : null, amount);
  }
  static mix(a, b, t = 0) {
    if (!b) return structuredClone(a);
    const walk = (x, y) => Object.fromEntries(Object.keys(x).map(k => [k, typeof x[k] === 'object' ? walk(x[k], y[k] || {}) : x[k] + ((y[k] ?? x[k]) - x[k]) * t]));
    return walk(a, b);
  }
}
