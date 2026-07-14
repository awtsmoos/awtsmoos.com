// B"H
// Boruch Hashem
// Blessed is He
/** @module WorldFork @description Forks immutable worlds into attributed private drafts. */
import { createWorldDraft } from './worldDraft.mjs';
import { createForkRecord } from '../provenance/forkRecord.mjs';

/** Creates a private world draft and its immutable fork record. */
export function forkWorld(publication, input) {
	if (publication?.state !== 'published' || publication?.type !== 'world') {
		throw new TypeError('World forks require an immutable published world.');
	}
	const owner = String(input?.owner || '').trim();
	const draft = createWorldDraft({
		...publication.payload,
		owner,
		title: input?.title || `${publication.payload.title} — Fork`,
		seed: input?.seed || `${publication.id}:${owner}`,
		metadata: { forkedFrom: publication.id }
	});
	return Object.freeze({
		draft,
		record: createForkRecord({
			sourceId: publication.id,
			forkId: draft.id,
			owner,
			attribution: publication.owner
		})
	});
}
