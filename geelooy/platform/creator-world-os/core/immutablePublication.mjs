// B"H
// Boruch Hashem
// Blessed is He
/** @module ImmutablePublication @description Seals validated drafts into immutable versions. */
import { stableObjectId } from './stableObjectId.mjs';

/** Publishes a draft as a recursively frozen immutable version. */
export function publishDraft(draft, input = {}) {
	if (draft?.state !== 'draft') {
		throw new TypeError('Publication requires a mutable draft.');
	}
	const publishedAt = String(input.publishedAt || new Date().toISOString());
	const version = Number(input.version || 1);
	if (!Number.isInteger(version) || version < 1) {
		throw new TypeError('Publication version must be a positive integer.');
	}
	const publication = {
		...clone(draft),
		id: stableObjectId(draft.type, draft.owner, `${draft.id}@${version}`),
		state: 'published',
		version,
		publishedAt,
		updatedAt: publishedAt,
		draftId: draft.id,
		validation: clone(input.validation || { ok: true })
	};
	delete publication.revision;
	return deepFreeze(publication);
}

/** Recursively freezes an object graph. */
export function deepFreeze(value) {
	if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
		return value;
	}
	for (const child of Object.values(value)) {
		deepFreeze(child);
	}
	return Object.freeze(value);
}

function clone(value) {
	return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}
