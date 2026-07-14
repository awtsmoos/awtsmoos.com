//B"H
//Boruch Hashem
//Blessed is He

/**
 * Open-world sanitation preserves authored missions, provisions, doors, techniques,
 * citizens, relationships, and finite positions. The Awtsmoos renews memory without
 * trusting stored shape; Awtsmoos.com keeps schema-v2 Expedition profiles compatible.
 */

import { EXPEDITION_LOCATIONS } from '../data/expedition/locationCatalog.js';
import { OPEN_WORLD_INTERIORS } from '../data/openworld/OpenWorldInteriorCatalog.js';
import { OPEN_WORLD_MERCHANT_OFFERS } from '../data/openworld/OpenWorldMerchantCatalog.js';
import { OPEN_WORLD_MISSIONS } from '../data/openworld/OpenWorldMissionCatalog.js';
import { boundedInteger } from '../expedition/ExpeditionProfileSanitizers.js';
import { createBaseOpenWorldProfile, openWorldCivicTitle } from './OpenWorldDefaults.js';
import { sanitizeOpenWorldSocial } from './OpenWorldProfileSocial.js';

const MISSION_STATUSES = new Set(['available', 'active', 'complete', 'claimed']);
const LOCATION_IDS = new Set(EXPEDITION_LOCATIONS.map(location => location.id));
const INTERIOR_IDS = new Set(OPEN_WORLD_INTERIORS.map(interior => interior.id));
const MISSION_IDS = new Set(OPEN_WORLD_MISSIONS.map(mission => mission.id));
const PROVISION_IDS = new Set(OPEN_WORLD_MERCHANT_OFFERS.map(offer => offer.provisionId));

export function sanitizeOpenWorldProfile(candidate = {}) {
	const base = createBaseOpenWorldProfile();
	const openWorld = {
		...base,
		missions: sanitizeMissions(candidate.missions),
		techniques: sanitizeTechniques(candidate.techniques),
		provisions: sanitizeProvisions(candidate.provisions),
		knownDoors: sanitizeDoors(candidate.knownDoors),
		lastStreetPositions: sanitizePositions(candidate.lastStreetPositions),
		rumors: sanitizeRumors(candidate.rumors),
		...sanitizeOpenWorldSocial(candidate),
		encountersResolved: boundedInteger(candidate.encountersResolved, 0, 999999),
		rests: boundedInteger(candidate.rests, 0, 999999)
	};
	openWorld.civicTitle = openWorldCivicTitle(openWorld);
	return openWorld;
}

function sanitizeMissions(candidate = {}) {
	return Object.fromEntries(
		Object.entries(candidate)
			.filter(([id, state]) => MISSION_IDS.has(id) && MISSION_STATUSES.has(state?.status))
			.map(([id, state]) => [
				id,
				{
					status: state.status,
					stageIndex: boundedInteger(state.stageIndex, 0, 32),
					progress: boundedInteger(state.progress, 0, 9999),
					locationId: LOCATION_IDS.has(state.locationId)
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

function sanitizeProvisions(candidate = {}) {
	return Object.fromEntries(
		[...PROVISION_IDS].map(id => [id, boundedInteger(candidate[id], 0, 9999)])
	);
}

function sanitizeDoors(values) {
	return [...new Set(Array.isArray(values) ? values : [])].filter(value => {
		const [locationId, interiorId] = String(value).split(':');
		return LOCATION_IDS.has(locationId) && INTERIOR_IDS.has(interiorId);
	});
}

function sanitizePositions(candidate = {}) {
	return Object.fromEntries(
		Object.entries(candidate)
			.filter(([locationId]) => LOCATION_IDS.has(locationId))
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
