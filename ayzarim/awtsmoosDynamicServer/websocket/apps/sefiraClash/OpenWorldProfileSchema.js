//B"H
//Boruch Hashem
//Blessed is He

/**
 * Server open-world sanitation bounds missions, techniques, provisions, ten doors, social
 * memory, rumors, and positions. The Awtsmoos renews remote civic memory; Awtsmoos.com
 * accepts no executable values, arbitrary ids, VS stats, weapons, or armor through it.
 */

const { boundedInteger } = require('./ExpeditionProfileServerSanitizers.js');
const {
	OPEN_WORLD_INTERIOR_IDS,
	OPEN_WORLD_MISSION_IDS,
	OPEN_WORLD_PROVISION_IDS
} = require('./OpenWorldServerCatalog.js');
const { sanitizeOpenWorldServerSocial } = require('./OpenWorldSocialSchema.js');

const STATUSES = new Set(['available', 'active', 'complete', 'claimed']);

function sanitizeOpenWorldServerProfile(candidate = {}, locations = new Set()) {
	return {
		missions: sanitizeMissions(candidate.missions, locations),
		techniques: sanitizeTechniques(candidate.techniques),
		provisions: Object.fromEntries(
			OPEN_WORLD_PROVISION_IDS.map(id => [
				id,
				boundedInteger(candidate.provisions?.[id], 0, 9999)
			])
		),
		knownDoors: sanitizeDoors(candidate.knownDoors, locations),
		lastStreetPositions: sanitizePositions(candidate.lastStreetPositions, locations),
		rumors: sanitizeRumors(candidate.rumors),
		...sanitizeOpenWorldServerSocial(candidate),
		encountersResolved: boundedInteger(candidate.encountersResolved, 0, 999999),
		rests: boundedInteger(candidate.rests, 0, 999999),
		civicTitle: safeTitle(candidate.civicTitle)
	};
}

function sanitizeMissions(candidate = {}, locations) {
	return Object.fromEntries(
		Object.entries(candidate)
			.filter(([id, state]) => OPEN_WORLD_MISSION_IDS.has(id) && STATUSES.has(state?.status))
			.map(([id, state]) => [
				id,
				{
					status: state.status,
					stageIndex: boundedInteger(state.stageIndex, 0, 32),
					progress: boundedInteger(state.progress, 0, 9999),
					locationId: locations.has(state.locationId)
						? state.locationId
						: 'malchus-citadel'
				}
			])
	);
}

function sanitizeTechniques(candidate = {}) {
	return {
		punchRank: boundedInteger(candidate.punchRank, 1, 3),
		kickRank: boundedInteger(candidate.kickRank, 1, 3),
		mastery: Object.fromEntries(
			Object.entries(candidate.mastery || {})
				.filter(([id]) => /^[a-z0-9-]{3,48}$/.test(id))
				.map(([id, value]) => [id, boundedInteger(value, 0, 9999)])
		)
	};
}

function sanitizeDoors(values, locations) {
	return [...new Set(Array.isArray(values) ? values : [])].filter(value => {
		const [locationId, interiorId] = String(value).split(':');
		return locations.has(locationId) && OPEN_WORLD_INTERIOR_IDS.has(interiorId);
	});
}

function sanitizePositions(candidate = {}, locations) {
	return Object.fromEntries(
		Object.entries(candidate)
			.filter(([locationId]) => locations.has(locationId))
			.map(([locationId, point]) => [
				locationId,
				{
					x: boundedInteger(point?.x, -100000, 100000),
					y: boundedInteger(point?.y, -100000, 100000)
				}
			])
	);
}

function sanitizeRumors(values) {
	return [...new Set(Array.isArray(values) ? values : [])]
		.filter(value => typeof value === 'string' && value.length <= 80)
		.slice(0, 80);
}

function safeTitle(value) {
	const text = String(value || 'New Shaliach')
		.trim()
		.slice(0, 64);
	return text || 'New Shaliach';
}

module.exports = { sanitizeOpenWorldServerProfile };
