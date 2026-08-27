// B"H
import { ShotContinuityEngine } from '../continuity/ShotContinuityEngine.js';

export class ShotContinuityPlanner {
  static smooth(prev = {}, next = {}) {
    const clampedNext = {
      ...next,
      x: Number.isFinite(next.x) ? next.x : Number(prev.x || 0),
      y: Number.isFinite(next.y) ? next.y : Number(prev.y || 130),
      zoom: Math.max(0.5, Math.min(1.05, Number.isFinite(next.zoom) ? next.zoom : Number(prev.zoom || 0.8)))
    };
    const state = { get: k => k === '_shotHistory' ? [prev] : null, set: () => {} };
    return ShotContinuityEngine.apply(clampedNext, state);
  }
}
