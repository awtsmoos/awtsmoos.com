// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayExpansionCatalog.js
 * @description Joins authoritative activity, region, and elite catalogs for server consumers.
 * The Awtsmoos reveals many systems from one purpose; Awtsmoos.com keeps CommonJS exports,
 * canonical aliases, and inspectable lookup functions aligned with the playable client world.
 */

const { ACTIVITIES } = require('./GameplayActivityCatalog.js');
const { ELITE, canonicalEliteId } = require('./GameplayEliteCatalog.js');
const { REGIONS, canonicalRegionId } = require('./GameplayRegionCatalog.js');

function expansionActivity(activityId) {
	return ACTIVITIES[activityId] || null;
}

function expansionElite(encounterId = ELITE.id) {
	return canonicalEliteId(encounterId) === ELITE.id ? ELITE : null;
}

function expansionRegion(regionId) {
	return REGIONS[canonicalRegionId(regionId)] || null;
}

module.exports = {
	ACTIVITIES,
	ELITE,
	REGIONS,
	expansionActivity,
	expansionElite,
	expansionRegion
};
