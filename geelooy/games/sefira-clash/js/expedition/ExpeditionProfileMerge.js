//B"H
//Boruch Hashem
//Blessed is He

/**
 * Profile merge reconciles offline progress without letting a stale copy erase a newer
 * covenant. The Awtsmoos renews both histories together; Awtsmoos.com unions permanent
 * Expedition and lived-city light while newer revisions choose mutable selections.
 */

import { mergeOpenWorldProfiles } from '../openworld/OpenWorldMerge.js';
import { sanitizeExpeditionProfile } from './ExpeditionProfile.js';

const QUEST_RANK = Object.freeze({ locked: 0, available: 1, active: 2, complete: 3, claimed: 4 });

export function mergeExpeditionProfiles(localProfile, remoteProfile) {
	const local = sanitizeExpeditionProfile(localProfile);
	const remote = sanitizeExpeditionProfile(remoteProfile);
	const remoteIsNewer = Number(remote.sync?.revision || 0) > Number(local.sync?.revision || 0);
	return sanitizeExpeditionProfile({
		...local,
		version: Math.max(local.version, remote.version),
		xp: Math.max(local.xp, remote.xp),
		perutas: Math.max(local.perutas, remote.perutas),
		reputation: mergeCounts(local.reputation, remote.reputation),
		discovered: union(local.discovered, remote.discovered),
		cleared: union(local.cleared, remote.cleared),
		inventory: union(local.inventory, remote.inventory),
		equipped: remoteIsNewer ? remote.equipped : local.equipped,
		quests: mergeQuests(local.quests, remote.quests),
		materials: mergeCounts(local.materials, remote.materials),
		crafted: union(local.crafted, remote.crafted),
		serviceClaims: union(local.serviceClaims, remote.serviceClaims),
		weatherClock: Math.max(local.weatherClock, remote.weatherClock),
		activeLocationId: remoteIsNewer ? remote.activeLocationId : local.activeLocationId,
		openWorld: mergeOpenWorldProfiles(local.openWorld, remote.openWorld, remoteIsNewer),
		sync: remoteIsNewer ? remote.sync : local.sync
	});
}

function mergeCounts(left = {}, right = {}) {
	const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
	return Object.fromEntries(
		[...keys].map(key => [key, Math.max(Number(left[key] || 0), Number(right[key] || 0))])
	);
}

function mergeQuests(left = {}, right = {}) {
	const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
	return Object.fromEntries(
		[...keys].map(key => {
			const a = left[key] || { status: 'locked', progress: 0 };
			const b = right[key] || { status: 'locked', progress: 0 };
			const status = QUEST_RANK[a.status] >= QUEST_RANK[b.status] ? a.status : b.status;
			return [
				key,
				{ status, progress: Math.max(Number(a.progress || 0), Number(b.progress || 0)) }
			];
		})
	);
}

function union(left = [], right = []) {
	return [...new Set([...left, ...right])];
}
