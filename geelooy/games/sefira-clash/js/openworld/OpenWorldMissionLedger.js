//B"H
//Boruch Hashem
//Blessed is He

/**
 * The shlichus ledger advances only ordered events witnessed in the lived world. The
 * Awtsmoos renews promise and deed together; Awtsmoos.com accepts exact targets, citizen
 * roles, and generic authored families while granting every reward once after return.
 */

import {
	openWorldMission,
	OPEN_WORLD_MISSIONS
} from '../data/openworld/OpenWorldMissionCatalog.js';
import { expeditionLevelFromXp } from '../expedition/ExpeditionDefaults.js';
import { openWorldCivicTitle } from './OpenWorldDefaults.js';
import { openWorldMissionStageMatches } from './OpenWorldMissionMatch.js';

export function openWorldMissionPresentations(profile, locationId) {
	return OPEN_WORLD_MISSIONS.map(mission => {
		const state = profile.openWorld.missions[mission.id] || availableState(locationId);
		const stage = mission.stages[state.stageIndex] || null;
		return { ...mission, state: { ...state }, stage, claimable: state.status === 'complete' };
	});
}

export function activateOpenWorldMission(profile, missionId, locationId) {
	const mission = openWorldMission(missionId);
	const existing = profile.openWorld.missions[missionId];
	if (!mission || ['active', 'complete', 'claimed'].includes(existing?.status)) {
		return { changed: false, profile, reason: 'MISSION_UNAVAILABLE' };
	}
	return {
		changed: true,
		profile: withMission(profile, missionId, {
			status: 'active',
			stageIndex: 0,
			progress: 0,
			locationId
		}),
		mission
	};
}

export function recordOpenWorldMissionEvent(profile, event) {
	let next = profile;
	const advanced = [];
	for (const [missionId, state] of Object.entries(profile.openWorld.missions)) {
		if (state.status !== 'active' || state.locationId !== event.locationId) continue;
		const mission = openWorldMission(missionId);
		const stage = mission?.stages[state.stageIndex];
		if (!openWorldMissionStageMatches(stage, event)) continue;
		const updated = advanceStage(state, stage, mission, event);
		next = withMission(next, missionId, updated);
		advanced.push(missionId);
	}
	return { profile: next, advanced };
}

export function claimOpenWorldMission(profile, missionId, regionId) {
	const mission = openWorldMission(missionId);
	const state = profile.openWorld.missions[missionId];
	if (!mission || state?.status !== 'complete') {
		return { claimed: false, profile, reason: 'MISSION_NOT_COMPLETE' };
	}
	const xp = profile.xp + mission.rewards.xp;
	const next = withMission(
		{
			...profile,
			xp,
			level: expeditionLevelFromXp(xp),
			perutas: profile.perutas + mission.rewards.perutas,
			reputation: {
				...profile.reputation,
				[regionId]: Number(profile.reputation[regionId] || 0) + mission.rewards.reputation
			}
		},
		missionId,
		{ ...state, status: 'claimed' }
	);
	next.openWorld.civicTitle = openWorldCivicTitle(next.openWorld);
	return { claimed: true, profile: next, mission, rewards: mission.rewards };
}

function advanceStage(state, stage, mission, event) {
	const progress = state.progress + Math.max(1, Number(event.count || 1));
	const completedStage = progress >= stage.count;
	const finalStage = completedStage && state.stageIndex >= mission.stages.length - 1;
	if (finalStage) return { ...state, status: 'complete', progress: stage.count };
	if (completedStage) return { ...state, stageIndex: state.stageIndex + 1, progress: 0 };
	return { ...state, progress };
}

function withMission(profile, missionId, state) {
	return {
		...profile,
		openWorld: {
			...profile.openWorld,
			missions: { ...profile.openWorld.missions, [missionId]: state }
		}
	};
}

function availableState(locationId) {
	return { status: 'available', stageIndex: 0, progress: 0, locationId };
}
