// B"H
/**
 * @file drink.js
 * @description
 * THE ACT OF SUSTENANCE (Ha’achala).
 * B"H - Animates the lifting of a vessel to the mouth.
 */
export const DRINK_BEHAVIOR = (time) => {
  const cycle = Math.sin(time * 0.005) * 0.5 + 0.5; // Slow cycle (0 to 1)
  
  // Lifting arm: 0 (relaxed) to -100 (up at face)
  const armAngle = -10 - (cycle * 85);
  const elbowAngle = 20 + (cycle * 70); 
  
  return {
    armL: 0,
    armR: armAngle,
    elbowL: 10,
    elbowR: elbowAngle,
    torsoSway: cycle * 5,
    bob: cycle * 2
  };
};
