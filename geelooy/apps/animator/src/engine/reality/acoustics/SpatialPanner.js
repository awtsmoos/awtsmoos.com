// B"H
/**
 * @file SpatialPanner.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 33: THE EARS OF BINAH (Oznayim D'Binah)
 * ═══════════════════════════════════════════════════════════════
 * 
 * "He who planted the ear, does He not hear?" (Tehillim 94:9)
 * 
 * Sound does not strike the center of the mind equally. It travels through 
 * the Chalal (Void), hitting the right ear (Netzach) or the left ear (Hod) 
 * at different times and volumes. 
 * 
 * This engine maps the absolute X/Y coordinates of a sound source against 
 * the Camera's X/Y coordinates using the Web Audio API `StereoPannerNode`.
 * If a character yells on the far right of the screen, your right speaker 
 * will rumble. The acoustic immersion is total.
 * 
 * @author Chariot of the Awtsmoos
 */

export class SpatialPanner {
  /**
   * @function bindToContext
   * @description Creates a panning pipeline for an audio oscillator or buffer.
   * @param {AudioContext} ctx - The master Web Audio API context.
   * @param {AudioNode} sourceNode - The origin of the sound (Oscillator/Buffer).
   * @param {number} soundX - World X coordinate of the event.
   * @param {number} cameraX - World X coordinate of the lens.
   * @param {number} zoom - Current viewport magnification.
   * @returns {GainNode} The final node to connect to ctx.destination.
   */
  static bindToContext(ctx, sourceNode, soundX, cameraX, zoom) {
    if (!ctx.createStereoPanner) {
      // Fallback for ancient browsers that lack the dimension of Binaural separation
      const fallbackGain = ctx.createGain();
      sourceNode.connect(fallbackGain);
      return fallbackGain;
    }

    const panner = ctx.createStereoPanner();
    const gain = ctx.createGain();

    // Calculate relative distance from the center of the viewport
    const deltaX = soundX - cameraX;
    
    // Normalize into a panning value between -1.0 (hard left) and 1.0 (hard right)
    // We assume the screen bounds are roughly 800px wide for panning extremes
    let panValue = (deltaX * zoom) / 800;
    panValue = Math.max(-1.0, Math.min(1.0, panValue));

    // Distance Attenuation (Inverse Square Law approximation)
    // The further away it is, the quieter it becomes
    const distanceStr = Math.abs(deltaX);
    const volumeMultiplier = Math.max(0.1, 1.0 - (distanceStr / 2500));

    panner.pan.value = panValue;
    gain.gain.value = volumeMultiplier;

    // Connect the chain: Source -> Panner -> Gain -> Return
    sourceNode.connect(panner);
    panner.connect(gain);

    return gain;
  }
}