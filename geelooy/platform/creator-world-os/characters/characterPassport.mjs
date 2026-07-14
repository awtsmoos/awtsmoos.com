// B"H
// Boruch Hashem
// Blessed is He
/** @module CharacterPassport @description Shares trusted identity without sharing game progression. */
import { stableObjectId } from '../core/stableObjectId.mjs';

/** Creates an immutable cross-world character passport. */
export function createCharacterPassport(input) {
	const accountId = text(input?.accountId, 'accountId');
	const aliasId = text(input?.aliasId, 'aliasId');
	const name = text(input?.name, 'name');
	const seed = input?.seed || `${accountId}:${aliasId}:${name}`;
	return Object.freeze({
		id: input?.id || stableObjectId('character', aliasId, seed),
		accountId,
		aliasId,
		name,
		appearance: Object.freeze({ ...(input?.appearance || {}) }),
		biography: String(input?.biography || ''),
		accessibility: Object.freeze({ ...(input?.accessibility || {}) }),
		createdAt: String(input?.createdAt || new Date().toISOString()),
		version: Number(input?.version || 1)
	});
}

function text(value, name) {
	const normalized = String(value || '').trim();
	if (!normalized) {
		throw new TypeError(`Character ${name} is required.`);
	}
	return normalized;
}
