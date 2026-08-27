
// B"H
/**
 * @file AcousticRaycaster.js
 * @description
 * 
 * ============================================================================
 * CHAPTER 3: THE SHATTERING VOICE (Kol Shoveir Arazim)
 * ============================================================================
 * "The voice of the Lord breaks the cedars."
 * Sound is not merely a text bubble appearing above a head. Sound has mass. 
 * It travels through the air, vibrating the atoms, and when it strikes a solid 
 * object, it reflects.
 * 
 * THE POEM OF THE ECHOING VOID:
 * The character shouts into the night,
 * A wave of sound, a wave of light!
 * It strikes the wall of brick and stone,
 * Returning in an undertone.
 * The text itself begins to bend,
 * As echoes ripple to the end!
 * 
 * @class AcousticRaycaster
 * @classdesc Calculates the physical propagation of sound waves originating from 
 * the mouth, detecting collisions with environment geometry to render echoes.
 * ============================================================================
 */

import { VirtualGraph as G } from '../../graph/VirtualGraph.js';

export class AcousticRaycaster {
  /**
   * @function propagate
   * @description Manifests sound waves visually if the intensity surpasses reality thresholds.
   * @param {Object} data - The speaker's data vessel.
   * @param {Object} scene - The physical dimensions of the environment.
   * @returns {Array<Object>} VirtualGraph nodes representing the soundwaves.
   */
  static propagate(data, scene) {
    const waves = [];
    const intensity = data.vocalIntensity || 0;

    // Only shouting produces visible acoustic distortion
    if (intensity > 0.8 && data.position) {
      const px = data.position.x;
      const py = data.position.y - 120; // Approx mouth height

      // The raw force of the voice creates concentric ripples in the air
      const rippleCount = Math.floor(intensity * 3);
      const timeOffset = Date.now() * 0.05;

      for (let i = 0; i < rippleCount; i++) {
        // The radius expands outward forever, looping via modulo
        const radius = ((timeOffset + i * 50) % 200) * intensity;
        const opacity = Math.max(0, 1.0 - (radius / 200));

        waves.push(G.circle(`acoustic_wave_${data.id}_${i}`, px, py, radius, {
          stroke: `rgba(255, 255, 255, ${opacity * 0.5})`,
          lineWidth: 2 + (intensity * 2)
        }));
      }

      // Raycast against walls (Echo logic)
      if (scene && scene.buildings) {
        scene.buildings.forEach((bld, idx) => {
          // If the building is within striking distance of the shout
          const dist = Math.abs(bld.x - px);
          if (dist < 300) {
            // Echo text! A faded, slightly larger copy of the speech bubble text
            if (data.speech) {
              const echoDelayX = px < bld.x ? -20 : 20; // Bounce away from wall
              waves.push(G.text(`echo_${idx}`, data.speech, px + echoDelayX, py - 100, {
                fill: `rgba(0, 255, 204, ${0.3 * intensity})`,
                font: '900 32px sans-serif',
                align: 'center'
              }));
            }
          }
        });
      }
    }

    return waves.length > 0 ? G.group(`acoustics_${data.id}`, null, waves) : null;
  }
}
