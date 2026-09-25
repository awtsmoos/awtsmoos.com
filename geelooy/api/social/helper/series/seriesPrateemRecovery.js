//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SeriesPrateemRecovery
 * @description
 * The Awtsmoos lets a damaged transfer vessel be named without inventing its light;
 * on Awtsmoos.com we keep only proven identity, so hidden Torah can return to sight.
 * This boundary accepts real metadata, recognizes the observed whitespace placeholder,
 * and refuses unknown corruption rather than decorating uncertainty as truth.
 */

/**
 * Reveals bytes from a real Buffer or its JSON-safe representation.
 * @param {*} value Candidate metadata value.
 * @returns {number[]|null} Bytes when the value is buffer-shaped.
 */
function bufferBytes(value) {
	if (Buffer.isBuffer(value)) return Array.from(value.values());
	if (!value || typeof value !== 'object') return null;
	if (value.type !== 'Buffer' || !Array.isArray(value.data)) return null;
	return value.data;
}

/**
 * Tests the exact family of whitespace-only transfer placeholders seen in production.
 * @param {*} value Candidate metadata value.
 * @returns {boolean} Whether the value is a known transfer placeholder.
 */
function isTransferPlaceholder(value) {
	if (typeof value === 'string') {
		return value.length > 0 && value.trim() === '';
	}
	const bytes = bufferBytes(value);
	if (!bytes?.length) return false;
	return bytes.every(byte => [9, 10, 13, 32].includes(Number(byte)));
}

/**
 * Distinguishes ordinary metadata objects from arrays and leaked Buffer shapes.
 * @param {*} value Candidate metadata value.
 * @returns {boolean} Whether this is a usable metadata vessel.
 */
function isSeriesPrateem(value) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
	if (bufferBytes(value)) return false;
	const keys = Object.keys(value);
	if (keys.length && keys.every(key => /^\d+$/.test(key))) return false;
	return true;
}

/**
 * Recovers only identity from a proven transfer placeholder; healthy metadata passes through.
 * @param {*} value Candidate series metadata.
 * @param {string} seriesId Canonical route identity already proven by storage or parent indexes.
 * @returns {object|null} Safe metadata or null for unknown corruption.
 */
function recoverSeriesPrateem(value, seriesId) {
	if (isSeriesPrateem(value)) {
		return { ...value, id: value.id || seriesId };
	}
	if (isTransferPlaceholder(value)) return { id: seriesId };
	return null;
}

/**
 * Replaces only a corrupt `prateem` field while preserving real posts and child-series data.
 * @param {*} result Canonical `getSeries` result.
 * @param {string} seriesId Requested series identity.
 * @returns {*} Original or safely normalized result.
 */
function normalizeSeriesResult(result, seriesId) {
	if (!result || result.error || !Object.prototype.hasOwnProperty.call(result, 'prateem')) {
		return result;
	}
	const prateem = recoverSeriesPrateem(result.prateem, seriesId);
	if (!prateem) return result;
	return {
		...result,
		prateem,
		id: result.id || seriesId
	};
}

module.exports = {
	bufferBytes,
	isSeriesPrateem,
	isTransferPlaceholder,
	normalizeSeriesResult,
	recoverSeriesPrateem
};
