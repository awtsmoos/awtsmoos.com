// B"H
// Boruch Hashem
// Blessed is He
/** @module CompatibilityMatrix @description Records support by format, architecture, API, and evidence level. */

/** Creates one immutable compatibility matrix. */
export function createCompatibilityMatrix(input) {
	const name = String(input?.name || '').trim();
	if (!name) {
		throw new TypeError('Compatibility matrix requires a name.');
	}
	const rows = (input?.rows || []).map(row => Object.freeze({
		format: String(row.format || ''),
		architecture: String(row.architecture || ''),
		apiFamily: String(row.apiFamily || ''),
		level: String(row.level || 'unsupported'),
		notes: String(row.notes || '')
	}));
	return Object.freeze({
		name,
		version: Number(input?.version || 1),
		rows: Object.freeze(rows),
		createdAt: String(input?.createdAt || new Date().toISOString())
	});
}

/** Finds the strongest exact compatibility row. */
export function findCompatibility(matrix, query) {
	return matrix?.rows.find(row => {
		return row.format === query.format &&
			row.architecture === query.architecture &&
			row.apiFamily === query.apiFamily;
	}) || null;
}
