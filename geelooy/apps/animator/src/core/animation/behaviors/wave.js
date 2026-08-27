
/* B”H */

/**
 * @constant WAVE_BEHAVIOR
 * @description
 * The math of greeting. The Awtsmoos constantly welcomes us into reality.
 * This sine wave calculates a joyful oscillation of the arm.
 */
export const WAVE_BEHAVIOR = (time) => {
  const speed = 0.015;
  // Right arm oscillates intensely between pointing up and right
  const waveAngle = -150 + Math.sin(time * speed) * 80;
  const torsoSway = Math.cos(time * speed * 0.5) * 15;
  
  return {
    armL: 0,
    armR: waveAngle,
    torsoSway
  };
};
