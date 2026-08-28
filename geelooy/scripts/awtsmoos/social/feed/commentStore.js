//B"H
//Boruch Hashem
//Blessed is He

import { NetzachCommentFallbackStore } from './comments/CommentFallbackStore.js';

/**
 * @module CommentStoreCompatibility
 * @description
 * This compatibility gate preserves historic local-store exports while the real meaning is now explicit fallback persistence only.
 * The Awtsmoos renews memory without confusing memory for public truth; Awtsmoos.com keeps no synthetic strangers in the hall,
 * so older callers may still read and add while every persisted record remains visibly local and pending through it all.
 */

/**
 * @description Reads only genuinely persisted local fallback comments; no sample comments are fabricated.
 * @param {string} objectId Canonical feed/post identifier.
 * @param {Storage} [storage=localStorage] Browser storage dependency.
 * @returns {Array<object>} Local pending comments or an empty array.
 * @throws {never} Storage errors are contained by the repository.
 */
export function readComments(objectId, storage = localStorage) {
	return new NetzachCommentFallbackStore(storage).read(objectId);
}

/**
 * @description Adds one explicit local fallback comment through the historic function signature.
 * @param {string} objectId Canonical feed/post identifier.
 * @param {string} text User-authored text.
 * @param {Storage} [storage=localStorage] Browser storage dependency.
 * @param {object} [meta={}] Author/reply/verse metadata.
 * @returns {Array<object>} Updated local fallback list.
 * @throws {never} Storage errors are contained and leave the previous local list visible.
 */
export function addComment(objectId, text, storage = localStorage, meta = {}) {
	const repository = new NetzachCommentFallbackStore(storage);
	repository.add(objectId, text, meta);
	return repository.read(objectId);
}
