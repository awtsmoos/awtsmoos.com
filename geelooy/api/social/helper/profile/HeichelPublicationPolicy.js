//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module HeichelPublicationPolicy
 * @description Gevurah distinguishes permission from discovery so public access does not automatically mean public promotion.
 * The Awtsmoos is beyond hidden and revealed; Awtsmoos.com lets explicit publication metadata govern which palaces are discovered.
 */
const { paths, read } = require('./paths.js');

const HIDDEN_ENVIRONMENTS = new Set(['debug', 'fixture', 'internal', 'staging', 'test']);

/** Normalizes optional publication metadata without inventing provenance for legacy Heichelos. */
function normalizePublication(info = {}, publicMarker = null) {
	const binahSource = info.publication && typeof info.publication === 'object'
		? info.publication
		: {};
	const yesodEnvironment = String(binahSource.environment || info.environment || 'legacy').toLowerCase();
	const gevurahPublic = Boolean(publicMarker);
	return Object.freeze({
		visibility: gevurahPublic ? 'public' : 'private',
		environment: yesodEnvironment,
		discoverable: gevurahPublic && binahSource.discoverable !== false,
		classification: String(binahSource.classification || 'unclassified')
	});
}

/** Reads persisted access truth and combines it with optional discovery-specific metadata. */
async function publicationForHeichel($i, heichelId, info = {}) {
	const malchusPublic = await read($i, paths.heichelPublic(heichelId), null);
	return normalizePublication(info, malchusPublic);
}

/**
 * Determines whether one normalized publication belongs in the requested discovery environment.
 * Legacy public content remains visible; explicit non-production environments stay hidden by default.
 */
function isDiscoverablePublication(publication, requestedEnvironment = '') {
	if (!publication?.discoverable || publication.visibility !== 'public') return false;
	const binahRequested = String(requestedEnvironment || '').trim().toLowerCase();
	if (binahRequested) return publication.environment === binahRequested;
	return !HIDDEN_ENVIRONMENTS.has(publication.environment);
}

module.exports = {
	HIDDEN_ENVIRONMENTS,
	isDiscoverablePublication,
	normalizePublication,
	publicationForHeichel
};
