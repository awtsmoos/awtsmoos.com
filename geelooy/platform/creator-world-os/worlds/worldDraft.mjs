// B"H
// Boruch Hashem
// Blessed is He
/** @module WorldDraft @description Creates mutable world drafts with deterministic seeds. */
import { createDraft } from '../core/mutableDraft.mjs';

/** Creates a private mutable world draft. */
export function createWorldDraft(input) {
	const title = String(input?.title || '').trim();
	const owner = String(input?.owner || '').trim();
	if (!title || !owner) {
		throw new TypeError('World draft requires title and owner.');
	}
	return createDraft({
		type: 'world',
		owner,
		seed: input?.seed || title,
		visibility: 'private',
		payload: {
			title,
			seed: String(input?.seed || title),
			runtime: input?.runtime || 'generic-world-v1',
			spawn: input?.spawn || null,
			entities: [...(input?.entities || [])],
			missions: [...(input?.missions || [])],
			rules: { ...(input?.rules || {}) },
			assets: [...(input?.assets || [])]
		},
		metadata: input?.metadata || {}
	});
}
