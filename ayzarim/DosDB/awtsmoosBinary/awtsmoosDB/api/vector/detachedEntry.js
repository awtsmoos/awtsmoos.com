// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/detachedEntry.js
 * @chapter Every Entry Surrenders Its Duplicate Vector Before Persistence
 * @description Normalizes detached vector entries and preserves only metadata in
 * payload rows while retaining one finite Float32 vector for graph construction.
 */

const { vectorOf } = require('./query.js');

function normalizeEntry(entry, index) {
	const source = entry || {};
	const vector = vectorOf(source.vector ?? source.vec ?? source.embedding);
	if (!vector) throw new Error(`B"H compact vector entry ${index} has no finite vector`);
	const rawPayload = source.payload ?? source.item ?? source;
	const payload = stripVectors(rawPayload);
	const key = String(source.key ?? source.id ?? payload?.id ?? index);
	return { key, vector, payload };
}

function normalizeEntries(entries) {
	return Array.from(entries || []).map(normalizeEntry);
}

function stripVectors(value) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
	const { vec, vector, embedding, payload, item, key, ...rest } = value;
	return { ...rest };
}

function validateDimensions(entries, dimensions) {
	for (let index = 0; index < entries.length; index++) {
		if (entries[index].vector.length !== dimensions) {
			throw new Error(`B"H compact vector entry ${index} has ${entries[index].vector.length} dimensions, expected ${dimensions}`);
		}
	}
}

module.exports = {
	normalizeEntries,
	stripVectors,
	validateDimensions
};
