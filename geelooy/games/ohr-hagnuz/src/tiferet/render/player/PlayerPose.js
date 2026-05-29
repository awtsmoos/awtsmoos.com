/**
 * B"H
 * @module PlayerPose
 *
 * Chapter 6: The Traveler Stopped Pretending A Turn Was A Body.
 * The Awtsmoos has no body and no form; but a drawn traveler needs honest
 * garments for front, back, and side. This data separates direction from cheap
 * rotation so each view receives its own face, shoulders, and hidden side.
 */
const VIEWS = {
  d: { view: 'front', mirror: 1 },
  u: { view: 'back', mirror: 1 },
  l: { view: 'side', mirror: -1 },
  r: { view: 'side', mirror: 1 },
  dl: { view: 'frontSide', mirror: -1 },
  dr: { view: 'frontSide', mirror: 1 },
  ul: { view: 'backSide', mirror: -1 },
  ur: { view: 'backSide', mirror: 1 }
};

/**
 * Resolves finite movement direction into an explicit anatomical view.
 *
 * @param {string} dir - Direction code from movement state.
 * @returns {{view:string, mirror:number}} Pose description for render modules.
 */
export const resolvePose = (dir = 'd') => VIEWS[dir] || VIEWS.d;

/**
 * Returns the walk cycle wave shared by arms, legs, and bobbing.
 *
 * @param {number} tick - Animation tick from game state.
 * @returns {{phase:number, arm:number, leg:number, bob:number, breath:number}}
 */
export const walkCycle = (tick = 0) => {
  const phase = (Math.floor(tick / 4) % 4) / 4 * Math.PI * 2;
  return {
    phase,
    arm: Math.sin(phase),
    leg: Math.cos(phase),
    bob: Math.abs(Math.sin(phase)),
    breath: 1 + Math.sin(tick * 0.05) * 0.02
  };
};
