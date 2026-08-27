
/* B"H */
import { ANIMATION_REGISTRY } from '../../../animation/data/AnimationRegistry.js';

/**
 * @constant JUMP_BEHAVIOR
 * @description
 * THE LEAP OF FAITH (Kefitzah).
 * Defying the gravity of Assiyah, the character launches into the air.
 * The body stretches on the way up, squashes on impact.
 */
export const JUMP_BEHAVIOR = (time) => {
  const jumpConfig = ANIMATION_REGISTRY.jump;
  const speed = 0.0065;
  const cycle = time * speed;
  const rawSin = Math.sin(cycle);
  
  const isAirborne = rawSin > 0;
  
  const power = jumpConfig?.curve?.power || 180;
  const impactSquash = jumpConfig?.curve?.impactSquash || 45;

  // A powerful but more realistic leap
  const altitude = isAirborne ? rawSin * power : Math.max(-impactSquash, rawSin * 55); 
  
  // Knees tuck in while jumping
  const kneeBend = isAirborne ? 130 * rawSin : 0;
  
  // Arms fling up
  const armSwing = isAirborne ? -200 * rawSin : 0;

  return {
    bob: altitude,
    hipL: isAirborne ? -30 : 0, 
    hipR: isAirborne ? 30 : 0,
    kneeL: kneeBend,
    kneeR: kneeBend,
    armL: armSwing,
    armR: -armSwing,
    torsoSway: 0,
    footRollL: isAirborne ? 45 : 0,
    footRollR: isAirborne ? 45 : 0
  };
};
