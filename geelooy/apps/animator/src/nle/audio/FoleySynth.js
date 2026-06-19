// B"H
import { SpatialPanner } from '../../engine/reality/acoustics/SpatialPanner.js';

/**
 * @file FoleySynth.js
 * @description
 * THE VOICE OF INANIMATE MATTER (Kol Nedamah).
 * B"H
 * 
 * RECTIFIED WITH SPATIAL PANNING (Improvement #36):
 * The generated oscillators no longer dump straight to the destination. 
 * They are passed through the SpatialPanner. If the footstep occurs 
 * on the left side of the world, your left speaker will vibrate.
 */
export class FoleySynth {
  static ctx = null;

  static init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  /**
   * @function step
   * @description Generates a spatially-aware, low-pass filtered thud for a footstep.
   * @param {number} intensity - The physical weight of the impact.
   * @param {number} soundX - World X coordinate of the footstep.
   * @param {number} cameraX - World X coordinate of the camera.
   * @param {number} zoom - Viewport zoom level.
   */
  static step(intensity = 1.0, soundX = 0, cameraX = 0, zoom = 1) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    
    // Muffle the sound to simulate a heavy, distant thud
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t); 

    // Pitch envelope (Thud simulation)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    // Wire the oscillator through the Spatial Panner!
    const spatialGain = SpatialPanner.bindToContext(this.ctx, filter, soundX, cameraX, zoom);
    
    // Apply final volume envelope to the spatial gain node
    spatialGain.gain.setValueAtTime(0, t);
    spatialGain.gain.linearRampToValueAtTime(1.0 * intensity, t + 0.01);
    spatialGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    osc.connect(filter);
    spatialGain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.15);
  }

  static wind(velocity = 1.0) {
    // B"H - Stub for procedural wind matrix.
    console.log(`B"H - Procedural wind whistling at velocity ${velocity}.`);
  }
}