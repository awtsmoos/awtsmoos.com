//B"H
//Boruch Hashem
//Blessed is He

/**
 * Profile merge distinguishes a current lawful update from a stale conflict. The
 * Awtsmoos renews both histories; Awtsmoos.com preserves permanent Expedition and
 * lived-city progress, permits current spending, and bounds stale mutable balances.
 */

const { sanitizeExpeditionServerProfile } = require('./ExpeditionProfileSchema.js');
const { mergeCurrentOpenWorld, mergeStaleOpenWorld } = require('./OpenWorldProfileMerge.js');
const { EXPEDITION_SERVER_CATALOG } = require('./ExpeditionServerCatalog.js');

const QUEST_RANK = Object.freeze({ locked: 0, available: 1, active: 2, complete: 3, claimed: 4 });

function mergeCurrentExpeditionProfiles(currentProfile, incomingProfile) {
	const current = sanitizeExpeditionServerProfile(currentProfile);
	const incoming = sanitizeExpeditionServerProfile(incomingProfile);
	return sanitizeExpeditionServerProfile({
		...incoming,
		xp: Math.max(current.xp, incoming.xp),
		reputation: mergeCounts(current.reputation, incoming.reputation),
		discovered: union(current.discovered, incoming.discovered),
		cleared: union(current.cleared, incoming.cleared),
		inventory: union(current.inventory, incoming.inventory),
		quests: mergeQuests(current.quests, incoming.quests),
		crafted: union(current.crafted, incoming.crafted),
		serviceClaims: union(current.serviceClaims, incoming.serviceClaims),
		weatherClock: Math.max(current.weatherClock, incoming.weatherClock),
		openWorld: mergeCurrentOpenWorld(
			current.openWorld,
			incoming.openWorld,
			EXPEDITION_SERVER_CATALOG.locations
		)
	});
}

function mergeStaleExpeditionProfiles(currentProfile, incomingProfile) {
	const current = sanitizeExpeditionServerProfile(currentProfile);
	const incoming = sanitizeExpeditionServerProfile(incomingProfile);
	return sanitizeExpeditionServerProfile({
		...mergeCurrentExpeditionProfiles(current, incoming),
		perutas: Math.max(current.perutas, incoming.perutas),
		materials: mergeCounts(current.materials, incoming.materials),
		equipped: current.equipped,
		activeLocationId: current.activeLocationId,
		openWorld: mergeStaleOpenWorld(
			current.openWorld,
			incoming.openWorld,
			EXPEDITION_SERVER_CATALOG.locations
		)
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

module.exports = { mergeCurrentExpeditionProfiles, mergeStaleExpeditionProfiles };
