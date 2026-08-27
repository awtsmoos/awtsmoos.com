//B"H
//Boruch Hashem
//Blessed is He

/**
 * Server profile schema mirrors durable Expedition and lived-city progress while
 * deriving level from XP. The Awtsmoos renews every accepted field; Awtsmoos.com stores
 * no client-derived combat stats, arbitrary ids, executable values, weapons, or armor.
 */

const { EXPEDITION_SERVER_CATALOG: CATALOG } = require('./ExpeditionServerCatalog.js');
const {
	boundedInteger,
	sanitizeCounts,
	sanitizeIdList,
	sanitizeQuestStates
} = require('./ExpeditionProfileServerSanitizers.js');
const { sanitizeOpenWorldServerProfile } = require('./OpenWorldProfileSchema.js');

const STARTER_GEAR = Object.freeze([
	'training-sword',
	'woven-vest',
	'travel-mantle',
	'path-boots',
	'spark-charm'
]);

const STARTER_LOADOUT = Object.freeze({
	weapon: 'training-sword',
	armor: 'woven-vest',
	mantle: 'travel-mantle',
	boots: 'path-boots',
	relic: 'spark-charm'
});

function sanitizeExpeditionServerProfile(candidate = {}) {
	const xp = boundedInteger(candidate.xp, 0, Number.MAX_SAFE_INTEGER);
	const equipped = sanitizeLoadout(candidate.equipped, candidate.inventory);
	return {
		version: 2,
		level: levelFromXp(xp),
		xp,
		perutas: boundedInteger(candidate.perutas, 0, Number.MAX_SAFE_INTEGER),
		reputation: sanitizeRegionCounts(candidate.reputation),
		discovered: sanitizeIdList(candidate.discovered, CATALOG.locations, ['malchus-citadel']),
		cleared: sanitizeIdList(candidate.cleared, CATALOG.locations),
		inventory: sanitizeIdList(candidate.inventory, CATALOG.gear, STARTER_GEAR),
		equipped,
		quests: sanitizeQuestStates(candidate.quests, CATALOG.quests),
		materials: sanitizeCounts(candidate.materials, CATALOG.materials),
		crafted: sanitizeIdList(candidate.crafted, CATALOG.recipes),
		serviceClaims: sanitizeIdList(candidate.serviceClaims, CATALOG.citizens),
		weatherClock: boundedInteger(candidate.weatherClock, 0, Number.MAX_SAFE_INTEGER),
		activeLocationId: CATALOG.locations.has(candidate.activeLocationId)
			? candidate.activeLocationId
			: 'malchus-citadel',
		openWorld: sanitizeOpenWorldServerProfile(candidate.openWorld, CATALOG.locations),
		sync: { profileId: '', revision: 0, syncedAt: 0 }
	};
}

function sanitizeRegionCounts(candidate = {}) {
	return Object.fromEntries(
		[...CATALOG.regions].map(regionId => [
			regionId,
			boundedInteger(candidate[regionId], 0, 9999)
		])
	);
}

function sanitizeLoadout(equipped = {}, inventory = []) {
	const owned = new Set([...STARTER_GEAR, ...(Array.isArray(inventory) ? inventory : [])]);
	const loadout = {};
	for (const [slot, starter] of Object.entries(STARTER_LOADOUT)) {
		const requested = equipped?.[slot];
		loadout[slot] = CATALOG.gear.has(requested) && owned.has(requested) ? requested : starter;
	}
	return loadout;
}

function levelFromXp(xp) {
	let level = 1;
	while (level < 50 && xp >= 125 * level * (level + 1)) level += 1;
	return level;
}

module.exports = { levelFromXp, sanitizeExpeditionServerProfile };
