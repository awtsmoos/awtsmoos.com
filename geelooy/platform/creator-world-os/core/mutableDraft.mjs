// B"H
// Boruch Hashem
// Blessed is He
/** @module MutableDraft @description Keeps ongoing creation explicitly mutable and revisioned. */
import { createObjectEnvelope } from './objectEnvelope.mjs';

/** Creates a mutable draft envelope. */
export function createDraft(input) {
	const envelope = createObjectEnvelope({
		...input,
		visibility: input?.visibility || 'private'
	});
	return {
		...envelope,
		state: 'draft',
		revision: 1,
		basePublicationId: input?.basePublicationId || null
	};
}

/** Returns a new draft revision without mutating the previous revision. */
export function reviseDraft(draft, changes, updatedAt = new Date().toISOString()) {
	if (draft?.state !== 'draft') {
		throw new TypeError('Only drafts can be revised.');
	}
	return {
		...draft,
		updatedAt,
		revision: Number(draft.revision || 0) + 1,
		payload: {
			...draft.payload,
			...(changes?.payload || changes || {})
		},
		metadata: {
			...draft.metadata,
			...(changes?.metadata || {})
		}
	};
}
