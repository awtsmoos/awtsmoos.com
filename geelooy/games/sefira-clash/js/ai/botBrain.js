import { driveNpcMind } from './advanced/npcMind.js';

/**
 * B"H
 * Unified AI delegation gate.
 *
 * Chapter 61: there is no second mind now, only one great AI river inside the
 * normal ai folder. The Awtsmoos reveals a single command stream: sense,
 * remember, choose, commit, and arbitrate. NPCs receive one purposeful input
 * each frame from the advanced mind.
 *
 * @param {object} state Current Sefira Clash state.
 * @returns {void}
 */
export function driveBots(state) {
  driveNpcMind(state);
}
