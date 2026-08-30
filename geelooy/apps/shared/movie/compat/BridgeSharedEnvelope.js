//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BridgeSharedEnvelope.js
 * @description The Awtsmoos preserves the shared movie's outer covenant while its scenes cross into a smaller core;
 * Awtsmoos.com carries cast, features, handoff, and metadata through one namespaced vessel, then reveals them restored once more.
 */
const SHARED_ENVELOPE_KEY = "awtsmoosSharedEnvelope";

/**
 * @description Builds deterministic-core metadata while preserving shared-only top-level protocol fields.
 * @param {object} sharedMovie - Canonical shared-protocol movie document.
 * @returns {object} Core metadata containing a private shared-envelope carrier.
 * @sideEffects None outside newly allocated clones.
 */
export function createCoreMetadataFromShared(sharedMovie = {}) {
	return {
		...structuredClone(sharedMovie.metadata || {}),
		sourceProtocol: sharedMovie.protocol || "awtsmoos-movie-v1",
		[SHARED_ENVELOPE_KEY]: captureSharedEnvelope(sharedMovie)
	};
}

/**
 * @description Reads preserved shared-only fields from a deterministic-core movie.
 * @param {object} coreMovie - Deterministic-core movie document.
 * @returns {{cast:Array,features:object,handoff:object}} Detached preserved shared envelope.
 * @sideEffects None outside newly allocated clones.
 */
export function readSharedEnvelope(coreMovie = {}) {
	const envelope = coreMovie.metadata?.[SHARED_ENVELOPE_KEY] || {};
	return {
		cast: cloneArray(envelope.cast),
		features: cloneRecord(envelope.features),
		handoff: cloneRecord(envelope.handoff)
	};
}

/**
 * @description Restores shared-facing metadata without leaking the private compatibility carrier.
 * @param {object} coreMovie - Deterministic-core movie document.
 * @returns {object} Shared-facing metadata record.
 * @sideEffects None outside the newly allocated metadata clone.
 */
export function createSharedMetadataFromCore(coreMovie = {}) {
	const metadata = structuredClone(coreMovie.metadata || {});
	delete metadata[SHARED_ENVELOPE_KEY];
	delete metadata.sourceProtocol;
	return {
		...metadata,
		title: coreMovie.title || metadata.title || "Untitled Awtsmoos Movie",
		personality: coreMovie.personality || metadata.personality || "animator",
		sourceSchema: "awtsmoos-movie-core-v1"
	};
}

/**
 * @description Captures shared-only top-level protocol fields for lossless roundtrip restoration.
 * @param {object} sharedMovie - Canonical shared-protocol movie document.
 * @returns {{cast:Array,features:object,handoff:object}} Detached shared envelope.
 * @sideEffects None outside newly allocated clones.
 */
function captureSharedEnvelope(sharedMovie) {
	return {
		cast: cloneArray(sharedMovie.cast),
		features: cloneRecord(sharedMovie.features),
		handoff: cloneRecord(sharedMovie.handoff)
	};
}

/**
 * @description Clones an optional array into a detached protocol-safe collection.
 * @param {unknown} value - Candidate array value.
 * @returns {Array} Detached array or an empty array.
 * @sideEffects None outside the returned clone.
 */
function cloneArray(value) {
	return Array.isArray(value) ? structuredClone(value) : [];
}

/**
 * @description Clones an optional plain object into a detached protocol-safe record.
 * @param {unknown} value - Candidate record value.
 * @returns {object} Detached record or an empty record.
 * @sideEffects None outside the returned clone.
 */
function cloneRecord(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return {};
	}
	return structuredClone(value);
}
