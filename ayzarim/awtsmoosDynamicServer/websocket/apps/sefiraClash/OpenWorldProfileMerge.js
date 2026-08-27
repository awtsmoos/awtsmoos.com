//B"H
//Boruch Hashem
//Blessed is He

/**
 * Server open-world merge preserves permanent civic progress across revision conflicts.
 * The Awtsmoos renews both histories; Awtsmoos.com permits current spending while stale
 * missions, ranks, doors, citizens, relationships, rumors, and encounters cannot regress.
 */

const { sanitizeOpenWorldServerProfile } = require('./OpenWorldProfileSchema.js');
const { mergeOpenWorldServerSocial } = require('./OpenWorldSocialSchema.js');

const STATUS_RANK = Object.freeze({ available: 0, active: 1, complete: 2, claimed: 3 });

function mergeCurrentOpenWorld(currentValue, incomingValue, locations) {
	const current = sanitizeOpenWorldServerProfile(currentValue, locations);
	const incoming = sanitizeOpenWorldServerProfile(incomingValue, locations);
	return sanitizeOpenWorldServerProfile(
		{
			...incoming,
			missions: mergeMissions(current.missions, incoming.missions),
			techniques: {
				punchRank: Math.max(current.techniques.punchRank, incoming.techniques.punchRank),
				kickRank: Math.max(current.techniques.kickRank, incoming.techniques.kickRank),
				mastery: mergeCounts(current.techniques.mastery, incoming.techniques.mastery)
			},
			knownDoors: union(current.knownDoors, incoming.knownDoors),
			rumors: union(current.rumors, incoming.rumors),
			...mergeOpenWorldServerSocial(current, incoming),
			encountersResolved: Math.max(current.encountersResolved, incoming.encountersResolved),
			rests: Math.max(current.rests, incoming.rests)
		},
		locations
	);
}

function mergeStaleOpenWorld(currentValue, incomingValue, locations) {
	const current = sanitizeOpenWorldServerProfile(currentValue, locations);
	const incoming = sanitizeOpenWorldServerProfile(incomingValue, locations);
	return sanitizeOpenWorldServerProfile(
		{
			...mergeCurrentOpenWorld(current, incoming, locations),
			provisions: mergeCounts(current.provisions, incoming.provisions),
			lastStreetPositions: current.lastStreetPositions,
			civicTitle: current.civicTitle
		},
		locations
	);
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

module.exports = { mergeCurrentOpenWorld, mergeStaleOpenWorld };
