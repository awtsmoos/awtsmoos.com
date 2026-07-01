// B"H
/**
 * @file CollisionBudget.js
 * @description Tiny frame budget recorder for collision work.
 */

const now = () => globalThis.performance?.now?.() || Date.now();

function finite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

export default class CollisionBudget {
  constructor(options = {}) {
    this.frameBudgetMs = Math.max(0.25, finite(options.frameBudgetMs, 2.5));
    this.historySize = Math.max(12, Math.floor(finite(options.historySize, 120)));
    this.frames = [];
    this.current = null;
    this.overBudget = 0;
    this.lastFrameAt = 0;
    this.fps = 0;
  }

  beginFrame() {
    const stamp = now();
    if (this.lastFrameAt) {
      const dt = Math.max(1, stamp - this.lastFrameAt);
      const instant = 1000 / dt;
      this.fps = this.fps ? this.fps * 0.9 + instant * 0.1 : instant;
    }
    this.lastFrameAt = stamp;
    this.current = { at:stamp, totalMs:0, sections:{}, exceeded:false };
    return this.current;
  }

  measure(label, fn) {
    if (!this.current) this.beginFrame();
    const start = now();
    try {
      return fn();
    } finally {
      const elapsed = now() - start;
      this.current.totalMs += elapsed;
      this.current.sections[label] = (this.current.sections[label] || 0) + elapsed;
      if (this.current.totalMs > this.frameBudgetMs) this.current.exceeded = true;
    }
  }

  endFrame(extra = {}) {
    if (!this.current) return null;
    const frame = { ...this.current, ...extra };
    if (frame.totalMs > this.frameBudgetMs || frame.exceeded) this.overBudget += 1;
    this.frames.push(frame);
    while (this.frames.length > this.historySize) this.frames.shift();
    this.current = null;
    return frame;
  }

  diag() {
    const last = this.frames[this.frames.length - 1] || this.current || null;
    const sum = this.frames.reduce((total, frame) => total + frame.totalMs, 0);
    return {
      frameBudgetMs:this.frameBudgetMs,
      lastFrameMs:last ? last.totalMs : 0,
      lastSections:last ? last.sections : {},
      overBudget:this.overBudget,
      frames:this.frames.length,
      averageMs:this.frames.length ? sum / this.frames.length : 0,
      fps:this.fps
    };
  }
}
