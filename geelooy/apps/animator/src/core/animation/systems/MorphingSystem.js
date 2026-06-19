
// B"H
import { EmotionMorpher } from '../../renderer/character/realism/EmotionMorpher.js'; 

/**
 * @file MorphingSystem.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 29: THE CORRUPTION OF THE VOID (Heshchatat HaAyin)
 * ═══════════════════════════════════════════════════════════════
 * 
 * THE POEM OF THE MISSING EYES:
 * The faces were blank, the eyes had vanished,
 * From the realm of light, the features were banished!
 * A variable undefined was multiplied by math,
 * Sending NaN corruption down the drawing path!
 * 
 * RECTIFICATION: 
 * If `data.morphParams[k]` is undefined, it now safely defaults to 
 * `targetMorph[k]` rather than evaluating as `NaN`.
 */
export class MorphingSystem {
  static process(data, time, dt) {
    const targetMorph = EmotionMorpher.process(data.id, data, dt);
    
    data.morphParams = data.morphParams || {};
    
    Object.keys(targetMorph).forEach(k => {
       const friction = 0.15;
       
       const currentVal = data.morphParams[k] !== undefined ? data.morphParams[k] : targetMorph[k];
       
       data.morphParams[k] = (currentVal * (1 - friction)) + (targetMorph[k] * friction);
    });
  }
}
