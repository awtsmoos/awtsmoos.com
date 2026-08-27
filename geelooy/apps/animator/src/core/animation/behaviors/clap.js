
/* B”H */

/**
 * @constant CLAP_BEHAVIOR
 * @description
 * THE STRIKING OF HANDS (Haka'at Kapayim).
 * The arms converge violently in the center of the chest, creating 
 * an overlapping motion driven by a high-frequency sine wave.
 */
export const CLAP_BEHAVIOR = (time) => {
  const speed = 0.02; // Very fast frequency
  const cycle = time * speed;
  const clapPhase = Math.sin(cycle); // Oscillates between -1 and 1
  
  // Normal resting arms are ~55 degrees (spread).
  // When clapping, they must converge inwards towards 0 degrees (straight down, overlapping).
  
  // As clapPhase approaches 1, arms swing inward (-55 + 50 = -5 degrees).
  const inwardSwing = Math.abs(clapPhase) * 60;
  
  // A slight upward lift as they clap
  const lift = Math.abs(clapPhase) * 20;

  return {
    armL: inwardSwing + lift, // Left arm moves positive (inward)
    armR: -inwardSwing - lift, // Right arm moves negative (inward)
    bob: Math.abs(clapPhase) * 5, // Slight body bounce on impact
    torsoSway: 0,
    hipL: 0, hipR: 0, kneeL: 0, kneeR: 0, footRollL: 0, footRollR: 0
  };
};
