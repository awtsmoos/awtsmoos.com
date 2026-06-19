// B"H
/**
 * @file SubsurfaceScattering.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 40: THE LIGHT BENEATH THE SKIN (Ohr Penimi)
 * ═══════════════════════════════════════════════════════════════
 * 
 * "For the life of the flesh is in the blood." (Vayikra 17:11)
 * 
 * Human skin is translucent. Light penetrates the epidermis, bounces off the 
 * crimson blood cells, and scatters back out. In standard 3D engines, this 
 * requires intensive ray-tracing. In our 2D geometric vector realm, we simulate 
 * it by injecting massive, extremely low-alpha red ellipses beneath the cheekbones.
 * 
 * When the character's heart rate increases (due to Joy, Anger, or Dancing), 
 * the alpha of these polygons scales up aggressively, creating an organic flush.
 * 
 * @class SubsurfaceScattering
 */

import { VirtualGraph as G } from '../../graph/VirtualGraph.js';

export class SubsurfaceScattering {
  /**
   * @function injectFlush
   * @description Renders capillary blood flow beneath the surface geometry.
   * @param {number} xOff - Base X placement for the cheek.
   * @param {number} yOff - Base Y placement for the cheek.
   * @param {Object} data - Emotion and physical state modifiers.
   * @returns {Object} A VirtualGraph node of the sub-dermal glow.
   */
  static injectFlush(xOff, yOff, data) {
    const isDancing = data.isDancing || false;
    const anger = data.anger || data.hate || 0;
    const joy = data.joy || (data.morphParams?.mouthSmile > 0 ? 0.5 : 0) || 0;

    // The heart beats faster during emotion or exercise
    const vitality = Math.max(isDancing ? 0.6 : 0, anger, joy);

    // Base sub-surface glow is always present faintly (0.04 alpha). 
    // It peaks heavily when flush (0.15 alpha).
    const bloodAlpha = 0.04 + (vitality * 0.11);

    // A massive, soft-edge simulated ellipse. 
    // Since we forbid standard shadowBlur, we draw 3 concentric ellipses of dropping alpha!
    return G.group(`sss_flush_${xOff}`, { x: xOff, y: yOff }, [
      G.ellipse('sss_core', 0, 0, 15, 22, 0, { fill: `rgba(255, 40, 40, ${bloodAlpha})` }),
      G.ellipse('sss_mid', 0, 0, 22, 32, 0, { fill: `rgba(255, 40, 40, ${bloodAlpha * 0.6})` }),
      G.ellipse('sss_outer', 0, 0, 30, 45, 0, { fill: `rgba(255, 40, 40, ${bloodAlpha * 0.3})` })
    ]);
  }
}