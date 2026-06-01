/**
 * B"H
 * @module PlayerPose
 *
 * Chapter 75: The stride became one whole sentence.
 * The Awtsmoos has no body and no form; the traveler is only a drawn vessel,
 * yet his step now crosses one tile in one complete wave instead of breaking
 * into harsh shards. Arms, legs, breath, and bob all obey the same 64-pixel vow.
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
 * B"H
 * @description Resolves finite movement direction into an anatomical view.
 * @param {string} dir Direction code from movement state.
 * @returns {{view:string, mirror:number}} Pose description for render modules.
 */
export const resolvePose = (dir = 'd') => VIEWS[dir] || VIEWS.d;

/**
 * B"H
 * @description Returns a full-tile walk wave with many smooth samples.
 * @param {number} tick Pixel progress through the current 64px tile.
 * @returns {{phase:number, arm:number, leg:number, bob:number, breath:number, stride:number, settle:number}}
 */
export const walkCycle = (tick = 0) => {
  const progress = Math.max(0, Math.min(1, tick / 64));
  const phase = progress * Math.PI * 2;
  const step = Math.sin(phase);
  const counter = Math.cos(phase);
  const heel = Math.sin(progress * Math.PI);
  return {
    phase,
    arm: step * 0.62,
    leg: counter * 0.72,
    bob: Math.max(0, heel) * 0.58,
    breath: 1 + Math.sin(tick * 0.035) * 0.016,
    stride: Math.abs(counter) * 0.84,
    settle: Math.max(0, Math.sin(phase + Math.PI)) * 0.14
  };
};
