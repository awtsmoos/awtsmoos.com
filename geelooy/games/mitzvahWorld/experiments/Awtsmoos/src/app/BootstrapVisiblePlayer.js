//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file BootstrapVisiblePlayer.js
 * @description Guards the historical bootstrap-player API so no generated human geometry can ever be created again.
 * Human presentation in MitzvahWorld is canonical-GLB-only; callers must load `player/chossid.glb` before gameplay.
 */

/**
 * Rejects every attempt to create the retired procedural human shell.
 * @throws {Error} Always, because generated human models are forbidden.
 */
export function createBootstrapVisiblePlayer() {
	throw new Error(
		'Generated human models are forbidden. Load the canonical chossid.glb before gameplay.'
	);
}
