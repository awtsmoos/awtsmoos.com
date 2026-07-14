//B"H
//Boruch Hashem
//Blessed is He

/**
 * Server social sanitation bounds relationships, acquaintances, dialogue, shortcuts,
 * patrols, and civic visits. The Awtsmoos renews remote memory without trusting shape;
 * Awtsmoos.com accepts only authored citizens and finite lowercase civic identifiers.
 */

const { boundedInteger } = require('./ExpeditionProfileServerSanitizers.js');
const { OPEN_WORLD_CITIZEN_IDS } = require('./OpenWorldServerCatalog.js');

function sanitizeOpenWorldServerSocial(candidate = {}) {
	return {
		relationships: sanitizeRelationships(candidate.relationships),
		knownCitizens: sanitizeCitizens(candidate.knownCitizens),
		dialogueFlags: sanitizeFlags(candidate.dialogueFlags),
		discoveredShortcuts: sanitizeFlags(candidate.discoveredShortcuts),
		patrols: sanitizeCounts(candidate.patrols),
		civicVisits: sanitizeCounts(candidate.civicVisits)
	};
}

function mergeOpenWorldServerSocial(left = {}, right = {}) {
	return sanitizeOpenWorldServerSocial({
		relationships: mergeMaximumCounts(left.relationships, right.relationships),
		knownCitizens: union(left.knownCitizens, right.knownCitizens),
		dialogueFlags: union(left.dialogueFlags, right.dialogueFlags),
		discoveredShortcuts: union(left.discoveredShortcuts, right.discoveredShortcuts),
		patrols: mergeMaximumCounts(left.patrols, right.patrols),
		civicVisits: mergeMaximumCounts(left.civicVisits, right.civicVisits)
	});
}

function sanitizeRelationships(candidate = {}) {
	return Object.fromEntries(
		Object.entries(candidate)
			.filter(([citizenId]) => OPEN_WORLD_CITIZEN_IDS.has(citizenId))
			.map(([citizenId, value]) => [citizenId, boundedInteger(value, -99, 99)])
	);
}

function sanitizeCitizens(values) {
	return [...new Set(Array.isArray(values) ? values : [])].filter(id =>
		OPEN_WORLD_CITIZEN_IDS.has(id)
	);
}

function sanitizeFlags(values) {
	return [...new Set(Array.isArray(values) ? values : [])]
		.filter(value => typeof value === 'string' && /^[a-z0-9:-]{3,96}$/.test(value))
		.slice(0, 240);
}

function sanitizeCounts(candidate = {}) {
	return Object.fromEntries(
		Object.entries(candidate)
			.filter(([id]) => /^[a-z0-9:-]{3,96}$/.test(id))
			.map(([id, value]) => [id, boundedInteger(value, 0, 9999)])
	);
}

function mergeMaximumCounts(left = {}, right = {}) {
	const keys = new Set([...Object.keys(left || {}), ...Object.keys(right || {})]);
	return Object.fromEntries(
		[...keys].map(key => [key, Math.max(Number(left?.[key] || 0), Number(right?.[key] || 0))])
	);
}

function union(left = [], right = []) {
	return [...new Set([...(left || []), ...(right || [])])];
}

module.exports = {
	mergeOpenWorldServerSocial,
	sanitizeOpenWorldServerSocial
};
