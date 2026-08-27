//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RadianceDiscovery
 * @description
 * One public doorway gathers the focused radiance vessels. The modules remain
 * small, but their shared purpose is one: let discovery on Awtsmoos.com reveal
 * why an item surfaced without pretending that a score measures a person.
 */

const {
	DEFAULT_RADIANCE_WEIGHTS,
	RADIANCE_LIMITS,
	createRadianceWeights
} = require('./RadianceWeights.js');
const {
	normalizeCandidate,
	normalizeUnit
} = require('./RadianceSignal.js');
const {
	scoreCandidate
} = require('./RadianceScorer.js');
const {
	rankByRadiance
} = require('./RadianceRanker.js');

module.exports = {
	DEFAULT_RADIANCE_WEIGHTS,
	RADIANCE_LIMITS,
	createRadianceWeights,
	normalizeCandidate,
	normalizeUnit,
	scoreCandidate,
	rankByRadiance
};
