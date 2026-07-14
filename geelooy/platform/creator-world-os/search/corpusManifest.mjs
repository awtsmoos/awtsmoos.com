// B"H
// Boruch Hashem
// Blessed is He
/** @module CorpusManifest @description Names semantic corpora with reproducible provenance. */

/** Creates a frozen corpus manifest. */
export function createCorpusManifest(input) {
	const id = text(input?.id, 'id');
	const sourceHash = text(input?.sourceHash, 'sourceHash');
	const dimensions = Number(input?.dimensions || 0);
	if (!Number.isInteger(dimensions) || dimensions < 1) {
		throw new TypeError('Corpus dimensions must be a positive integer.');
	}
	return Object.freeze({
		id,
		version: Number(input?.version || 1),
		sourceHash,
		rowSchema: text(input?.rowSchema || 'default', 'rowSchema'),
		dimensions,
		metric: input?.metric || 'cosine',
		model: text(input?.model, 'model'),
		visibility: input?.visibility || 'private',
		createdAt: String(input?.createdAt || new Date().toISOString()),
		metadata: Object.freeze({ ...(input?.metadata || {}) })
	});
}

function text(value, name) {
	const normalized = String(value || '').trim();
	if (!normalized) {
		throw new TypeError(`Corpus ${name} is required.`);
	}
	return normalized;
}
