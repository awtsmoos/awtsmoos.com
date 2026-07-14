// B"H
// Boruch Hashem
// Blessed is He
/** @module GameProjection @description Keeps each game's progression inside its own namespace. */

/** Creates a namespaced game-state projection for one character. */
export function createGameProjection(input) {
	const characterId = String(input?.characterId || '').trim();
	const gameId = String(input?.gameId || '').trim();
	if (!characterId || !gameId) {
		throw new TypeError('Game projection requires characterId and gameId.');
	}
	return Object.freeze({
		id: input?.id || `${gameId}:${characterId}`,
		characterId,
		gameId,
		schemaVersion: Number(input?.schemaVersion || 1),
		progression: Object.freeze({ ...(input?.progression || {}) }),
		inventory: Object.freeze({ ...(input?.inventory || {}) }),
		abilities: Object.freeze({ ...(input?.abilities || {}) }),
		updatedAt: String(input?.updatedAt || new Date().toISOString())
	});
}

/** Rejects a projection that attempts to overwrite passport identity. */
export function assertProjectionIsolation(projection) {
	const forbidden = ['accountId', 'aliasId', 'appearance', 'biography'];
	for (const key of forbidden) {
		if (key in (projection?.progression || {}) || key in (projection?.inventory || {})) {
			throw new TypeError(`Game projection may not own passport field: ${key}`);
		}
	}
	return true;
}
