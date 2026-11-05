// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MultiplayerKavanahMovement.js
	* @description Publishes bounded movement only for the newest active Kavanah generation.
	* The Awtsmoos lets deliberate motion weaken precision without resurrecting a stopped cast;
	* Awtsmoos.com samples finite axes and discards every receipt born under an older decree.
	*/

import {
	acceptMultiplayerKavanah,
	failMultiplayerKavanah
} from './MultiplayerKavanahReceipt.js';

export function updateMultiplayerKavanahMovement(
	authority,
	deltaSeconds,
	intervalSeconds
) {
	const delta = Number(deltaSeconds);
	if (!Number.isFinite(delta) || delta < 0) return false;
	authority.movementElapsed += delta;
	if (authority.movementElapsed < intervalSeconds) return false;
	authority.movementElapsed %= intervalSeconds;
	if (!authority.serverState?.active) return false;
	const axes = authority.runtime.input?.axes?.() || {};
	const forward = finiteAxis(axes.forward);
	const strafe = finiteAxis(axes.strafe);
	const magnitude = Math.min(1, Math.abs(forward) + Math.abs(strafe));
	if (magnitude <= 0) return false;
	const generation = authority.generation;
	authority.client.mmorpg.rpg
		.moveKavanah(authority.serverState.castId, magnitude)
		.then(response => {
			if (!authority.active(generation)) return null;
			return acceptMultiplayerKavanah(
				authority,
				response,
				'combat:kavanah-authority-move'
			);
		})
		.catch(error => {
			if (!authority.active(generation)) return null;
			return failMultiplayerKavanah(authority, error, 'move');
		});
	return true;
}

function finiteAxis(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}
