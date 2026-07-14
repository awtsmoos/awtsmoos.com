// B"H
// Boruch Hashem
// Blessed is He
/** @module ForkRecord @description Records an attributed branch from immutable work. */
import { createAncestryLink } from './ancestryLink.mjs';

/** Creates a fork record with explicit source and owner. */
export function createForkRecord(input) {
	const sourceId = String(input?.sourceId || '').trim();
	const forkId = String(input?.forkId || '').trim();
	const owner = String(input?.owner || '').trim();
	if (!sourceId || !forkId || !owner) {
		throw new TypeError('Fork record requires sourceId, forkId, and owner.');
	}
	const createdAt = String(input?.createdAt || new Date().toISOString());
	return Object.freeze({
		sourceId,
		forkId,
		owner,
		createdAt,
		attribution: String(input?.attribution || sourceId),
		ancestry: createAncestryLink({
			parentId: sourceId,
			childId: forkId,
			relation: 'forked-from',
			createdAt,
			createdBy: owner
		})
	});
}
