/**
 * B"H
 * Smash-like game feel constants.
 *
 * Gravity is stronger, friction is clearer, air drift is readable, and falling
 * is capped so recovery remains possible. These numbers are practical vessels:
 * not realism, but fun 2D arena combat.
 */
export const GAME = {
  gravity: 0.68,
  friction: 0.78,
  airFriction: 0.965,
  maxFall: 20,
  tick: 1 / 60
};

export const INPUTS = ['jump', 'punch', 'kick', 'grab', 'shield', 'special'];
export const COLORS = { gold: '#f3c85f', ink: '#08050d', parchment: '#e8ddc3' };
