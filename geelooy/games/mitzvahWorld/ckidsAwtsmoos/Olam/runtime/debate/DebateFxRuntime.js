/**
 * B"H
 * @file DebateFxRuntime.js
 *
 * Chapter 32: Letters Struck The Air Like Lightning.
 *
 * The Awtsmoos lets an argument become visible without trapping the argument
 * inside the renderer. This module emits small FX packets: impact, collapse,
 * resonance. Later, particles and glyphs can drink from the same stream.
 */

const TYPE_EFFECT = Object.freeze({
  pshat: 'earthImpact',
  remez: 'waterHintTrail',
  derush: 'fireBurst',
  sod: 'airGlyphReveal'
});

export function createDebateFxEvent({ type, strength, targetId }) {
  return {
    kind: TYPE_EFFECT[type] || 'unknownSpark',
    type,
    strength,
    targetId,
    intensity: strength === 'strong' ? 3 : strength === 'weak' ? 1 : 2
  };
}

export class DebateFxQueue {
  constructor() {
    this.events = [];
  }

  push(turn) {
    const event = createDebateFxEvent(turn);
    this.events.push(event);
    return event;
  }

  drain() {
    const copy = [...this.events];
    this.events.length = 0;
    return copy;
  }
}
