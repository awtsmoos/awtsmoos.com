//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file LavaPlayerState.js
 * @description Owns player-state transitions entering, resetting inside, and leaving the isolated lava challenge.
 * Movement state stays renderer-neutral and uses only native JavaScript object mutation.
 */

import {
	ERETZ_RETURN,
	LAVA_START
} from './LavaCourseDefinitions.js';

/**
 * Resets the traveler onto the deterministic lava-course starting platform.
 * @param {object} state Mutable runtime player state.
 * @param {object} ground Ground sampler exposing heightAt(x, z).
 * @param {number} footOffset Player foot-to-origin offset.
 * @returns {void}
 */
export function resetLavaPlayer(state, ground, footOffset) {
	placePlayer(state, ground, footOffset, LAVA_START);
}

/**
 * Returns the traveler to the canonical Eretz landing point after leaving lava.
 * @param {object} state Mutable runtime player state.
 * @param {object} ground Ground sampler exposing heightAt(x, z).
 * @param {number} footOffset Player foot-to-origin offset.
 * @returns {void}
 */
export function returnPlayerToEretz(state, ground, footOffset) {
	placePlayer(state, ground, footOffset, ERETZ_RETURN);
}

/**
 * Applies one grounded placement without duplicating movement-state reset logic.
 * @param {object} state Mutable runtime player state.
 * @param {object} ground Ground sampler exposing heightAt(x, z).
 * @param {number} footOffset Player foot-to-origin offset.
 * @param {{x:number,z:number}} point Horizontal destination.
 * @returns {void}
 */
function placePlayer(state, ground, footOffset, point) {
	state.x = point.x;
	state.z = point.z;
	state.y = ground.heightAt(state.x, state.z) + footOffset;
	state.renderY = state.y;
	state.velY = 0;
	state.grounded = true;
}
