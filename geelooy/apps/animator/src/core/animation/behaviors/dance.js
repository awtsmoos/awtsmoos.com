
/* B”H */

/**
 * @constant DANCE_BEHAVIOR
 * @description
 * The ecstasy of existence (Simcha). A high-BPM chaotic joy.
 * Knees bending, arms flailing to the heavens in praise, 
 * hips swaying rapidly. The absolute peak of animation realism.
 */
export const DANCE_BEHAVIOR = (time) => {
  const bpm = 145;
  const bps = bpm / 60;
  const speed = (time / 1000) * bps * Math.PI; 
  
  const bounce = Math.abs(Math.sin(speed)) * 15; // Gentler impact
  const sway = Math.sin(speed * 0.4) * 20; // Gentler sway
  const twist = Math.cos(speed * 0.8) * 15; // Gentler twist

  return {
    bob: bounce * 0.3,
    hipL: sway * 0.3 + twist * 0.3,
    hipR: sway * 0.3 - twist * 0.3,
    kneeL: bounce * 0.5,
    kneeR: bounce * 0.5,
    armL: -45 + Math.sin(speed * 1) * 20, // Peaceful movement
    armR: 45 + Math.cos(speed * 1) * 20,
    torsoSway: twist * 0.2
  };
};
