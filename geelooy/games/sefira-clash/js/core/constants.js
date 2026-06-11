/**
 * B"H
 * Smash-like game feel constants.
 *
 * Chapter 81: the ground stops being mud. Friction preserves enough speed to
 * feel responsive, air drift stays controlled, and gravity keeps jumps sharp.
 */
export const GAME = {
  gravity: 0.68,
  friction: 0.86,
  airFriction: 0.955,
  maxFall: 20,
  tick: 1 / 60
};

export const INPUTS = ['jump', 'punch', 'kick', 'grab', 'shield', 'special'];
export const COLORS = { gold: '#f3c85f', ink: '#08050d', parchment: '#e8ddc3' };
