// B"H
/**
 * @file Dialogue.js
 * @description
 * THE ART OF PERSUASION.
 * B"H - Organic gestures for character dialogue.
 */
export const DIALOGUE_BEHAVIOR = (time, intensity = 1.0) => {
  const slow = time * 0.002;
  const fast = time * 0.01;

  return {
    // Subtle head tilt and sway
    headTilt: Math.sin(slow) * 4 * intensity,
    headBob: Math.cos(fast) * 2 * intensity,
    
    // Hand gestures (communicated through arm state)
    armL: 20 + Math.sin(slow * 1.5) * 15 * intensity,
    armR: -20 + Math.cos(slow * 1.2) * 25 * intensity,
    
    // Elbow flex for 'prior taking' (talking) poses
    elbowL: 35 + Math.sin(fast) * 10 * intensity,
    elbowR: -35 + Math.cos(fast) * 15 * intensity,
    
    // Torso emphasis
    torsoSway: Math.sin(slow * 0.8) * 3 * intensity
  };
};
