//B"H
//Boruch Hashem
//Blessed is He

/**
 * Open-world merge preserves missions, techniques, doors, citizens, relationships,
 * rumors, and encounters across offline conflicts. The Awtsmoos renews both histories;
 * Awtsmoos.com lets the newest revision choose spendable provisions while light advances.
 */

import { sanitizeOpenWorldProfile } from './OpenWorldProfile.js';
import { mergeOpenWorldSocial } from './OpenWorldProfileSocial.js';

const STATUS_RANK = Object.freeze({ available: 0, active: 1, complete: 2, claimed: 3 });

export function mergeOpenWorldProfiles(localProfile, remoteProfile, remoteIsNewer = false) {
	const local = sanitizeOpenWorldProfile(localProfile);
	const remote = sanitizeOpenWorldProfile(remoteProfile);
	return sanitizeOpenWorldProfile({
		...local,
		missions: mergeMissions(local.missions, remote.missions),
		techniques: {
			punchRank: Math.max(local.techniques.punchRank, remote.techniques.punchRank),
			kickRank: Math.max(local.techniques.kickRank, remote.techniques.kickRank),
			mastery: mergeCounts(local.techniques.mastery, remote.techniques.mastery)
		},
		provisions: remoteIsNewer ? remote.provisions : local.provisions,
		knownDoors: union(local.knownDoors, remote.knownDoors),
		lastStreetPositions: remoteIsNewer
			? { ...local.lastStreetPositions, ...remote.lastStreetPositions }
			: { ...remote.lastStreetPositions, ...local.lastStreetPositions },
		rumors: union(local.rumors, remote.rumors),
		...mergeOpenWorldSocial(local, remote),
		encountersResolved: Math.max(local.encountersResolved, remote.encountersResolved),
		rests: Math.max(local.rests, remote.rests)
	});
}

function mergeMissions(left = {}, right = {}) {
	const ids = new Set([...Object.keys(left), ...Object.keys(right)]);
	return Object.fromEntries(
		[...ids].map(id => {
			const first = left[id];
			const second = right[id];
			if (!first) return [id, second];
			if (!second) return [id, first];
			const selected =
				STATUS_RANK[second.status] > STATUS_RANK[first.status] ||
				second.stageIndex > first.stageIndex
					? second
					: first;
			return [
				id,
				{
					...selected,
					stageIndex: Math.max(first.stageIndex, second.stageIndex),
					progress: Math.max(first.progress, second.progress)
				}
			];
		})
	);
}

function mergeCounts(left = {}, right = {}) {
	const ids = new Set([...Object.keys(left), ...Object.keys(right)]);
	return Object.fromEntries(
		[...ids].map(id => [id, Math.max(Number(left[id] || 0), Number(right[id] || 0))])
	);
}

function union(left = [], right = []) {
	return [...new Set([...left, ...right])];
}
