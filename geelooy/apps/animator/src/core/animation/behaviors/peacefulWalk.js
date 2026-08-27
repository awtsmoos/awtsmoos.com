// B"H
/**
 * @file peacefulWalk.js
 * @description THE CALM LOCOMOTION.
 */
export const peacefulWalk = (time, intensity = 1) => {
  const speed = (time / 1000) * (intensity * 0.5) * Math.PI; 
  const bounce = Math.abs(Math.sin(speed)) * 10;
  const sway = Math.sin(speed * 0.5) * 5;

  return {
    bob: bounce * 0.2,
    hipL: sway,
    hipR: -sway,
    kneeL: bounce * 0.5,
    kneeR: bounce * 0.5,
    armL: -20 + Math.sin(speed) * 10,
    armR: 20 - Math.sin(speed) * 10,
    torsoSway: sway * 0.1
  };
};
