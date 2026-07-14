// B"H
// Boruch Hashem
// Blessed is He
/** @module CharacterRecovery @description Recovers expired authority without silently stealing live leases. */
import { characterLeaseActive, createCharacterLease } from './characterLease.mjs';

/** Creates a replacement lease only when the previous lease is inactive. */
export function recoverCharacterLease(previousLease, input, now = Date.now()) {
	if (characterLeaseActive(previousLease, now)) {
		throw new TypeError('Active character leases cannot be recovered or stolen.');
	}
	const generation = Number(previousLease?.generation || 0) + 1;
	return Object.freeze({
		lease: createCharacterLease({
			...input,
			characterId: previousLease?.characterId || input?.characterId,
			generation
		}, now),
		recoveredFrom: previousLease || null,
		reason: String(input?.reason || 'expired-lease'),
		recoveredAt: new Date(now).toISOString()
	});
}
