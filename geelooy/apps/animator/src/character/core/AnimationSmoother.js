// B"H
/**
 * @file AnimationSmoother.js
 * @description
 * THE BALANCER (Tiferet).
 * B"H - Ensures smooth interpolation between character states to prevent "switching" artifacts.
 */
export class AnimationSmoother {
  constructor() {
    this.history = new Map();
  }

  /**
   * Smoothes the character data before it hits the assembler.
   */
  smooth(id, data, dt = 16) {
    if (!this.history.has(id)) {
      this.history.set(id, JSON.parse(JSON.stringify(data)));
      return data;
    }

    const prev = this.history.get(id);
    const result = { ...data };
    const lerpFactor = 0.25; // B"H - Balance between speed and grace

    // Smooth limbs
    if (data.walk && prev.walk) {
      result.walk = { ...data.walk };
      Object.keys(data.walk).forEach(key => {
        if (typeof data.walk[key] === 'number') {
           result.walk[key] = this.lerp(prev.walk[key], data.walk[key], lerpFactor);
        }
      });
    }

    // Smooth idle
    if (data.idle && prev.idle) {
      result.idle = { ...data.idle };
      Object.keys(data.idle).forEach(key => {
        if (typeof data.idle[key] === 'number') {
           result.idle[key] = this.lerp(prev.idle[key], data.idle[key], lerpFactor);
        }
      });
    }

    // Smooth generic numeric props
    ['mouthOpen', 'rotation'].forEach(prop => {
      if (typeof data[prop] === 'number') {
        result[prop] = this.lerp(prev[prop], data[prop], lerpFactor);
      }
    });

    this.history.set(id, JSON.parse(JSON.stringify(result)));
    return result;
  }

  lerp(a, b, t) {
    if (isNaN(a)) return b;
    return a + (b - a) * t;
  }
}

export const ANIMATION_SMOOTHER = new AnimationSmoother();
