//B"H
//Boruch Hashem
//Blessed is He

/**
 * Citizen state turns immutable identities into lightweight scheduled social actors. The
 * Awtsmoos renews person and remembered relationship; Awtsmoos.com stores no fighter
 * body, attack state, or pathfinder inside this Malchus-facing civic representation.
 */

import { openWorldCitizensForRegion } from '../data/openworld/OpenWorldCitizenCatalog.js';
import { openWorldCitizenSchedule } from './OpenWorldCitizenSchedule.js';

export function createOpenWorldCitizenStates(state, profile) {
	const world = state.openWorld;
	const clock = state.expedition?.weather?.clock || 0;
	return openWorldCitizensForRegion(world.regionId).map((citizen, index) => {
		const schedule = openWorldCitizenSchedule(citizen, clock);
		const position = citizenPosition(state, citizen, schedule.sceneId, index);
		return {
			...citizen,
			...position,
			sceneId: schedule.sceneId,
			activity: schedule.activity,
			relationship: Number(profile.openWorld.relationships?.[citizen.id] || 0),
			known: profile.openWorld.knownCitizens?.includes(citizen.id) || false,
			w: 70,
			h: 150,
			kind: 'citizen',
			targetable: false
		};
	});
}

export function refreshCitizenSchedule(state, citizen) {
	const clock = state.expedition?.weather?.clock || 0;
	const schedule = openWorldCitizenSchedule(citizen, clock);
	const index = state.openWorld.citizens.findIndex(item => item.id === citizen.id);
	const position = citizenPosition(state, citizen, schedule.sceneId, Math.max(0, index));
	Object.assign(citizen, position, schedule);
	return citizen;
}

function citizenPosition(state, citizen, sceneId, index) {
	if (sceneId === 'street') return streetPosition(state, citizen.id, index);
	const interior = state.openWorld.scenes.interiors[sceneId];
	const service = interior?.openWorld?.serviceNode;
	return {
		x: Number(service?.x || 160) + 40 + (index % 3) * 95,
		y: Number(service?.y || 430) + 120
	};
}

function streetPosition(state, citizenId, index) {
	const bounds = state.openWorld.scenes.street.bounds;
	const span = bounds.right - bounds.left - 360;
	const ratio = stableRatio(`${state.openWorld.locationId}:${citizenId}:${index}`);
	return {
		x: bounds.left + 180 + span * ratio,
		y: state.openWorld.scenes.floorY
	};
}

function stableRatio(seed) {
	let hash = 2166136261;
	for (const character of seed) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return (Math.abs(hash) % 1000) / 1000;
}
