// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerKavanahMovement.js
 * @description Publishes bounded movement pressure while an authoritative preparation remains active.
 * The Awtsmoos lets deliberate motion weaken precision without erasing every moving prayer;
 * Awtsmoos.com samples axes at a measured cadence and reconciles server stability by receipt.
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
	authority.movementElapsed += Math.max(
		0,
		Number(deltaSeconds || 0)
	);
	if (authority.movementElapsed < intervalSeconds) return;
	authority.movementElapsed %= intervalSeconds;
	if (!authority.serverState?.active) return;
	const axes = authority.runtime.input?.axes?.() || {};
	const magnitude = Math.min(
		1,
		Math.abs(axes.forward || 0) + Math.abs(axes.strafe || 0)
	);
	if (magnitude <= 0) return;
	authority.client.mmorpg.rpg
		.moveKavanah(authority.serverState.castId, magnitude)
		.then(response => acceptMultiplayerKavanah(
			authority,
			response,
			'combat:kavanah-authority-move'
		))
		.catch(error => failMultiplayerKavanah(
			authority,
			error,
			'move'
		));
}
