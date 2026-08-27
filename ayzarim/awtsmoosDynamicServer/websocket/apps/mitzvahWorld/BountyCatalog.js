// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BountyCatalog.js
 * @description Declares repeatable village requests, regional bounties, and hidden challenges.
 * The Awtsmoos turns ordinary return into chosen service; Awtsmoos.com keeps proof source,
 * threshold, repeatability, reward material, experience, and hidden presentation explicit.
 */

const BOUNTIES = Object.freeze({
	'hidden-cache-challenge': bounty('activity', 'hidden-cache', 1, false, 'upgrade-sigil', 60, true),
	'kedem-herbal-request': bounty('activity', 'herb-gathering', 3, true, 'letter-fragment', 55, false),
	'meadow-service-request': bounty('activity-total', null, 4, true, 'village-token', 45, false),
	'warden-bounty': bounty('reward', 'elite:kedem-letter-warden', 1, false, 'warden-seal', 120, false)
});

function bounty(sourceType, sourceId, threshold, repeatable, materialId, xp, hidden) {
	return Object.freeze({
		hidden,
		materialId,
		repeatable,
		sourceId,
		sourceType,
		threshold,
		xp
	});
}

function bountyDefinition(bountyId) {
	return BOUNTIES[bountyId] || null;
}

module.exports = {
	BOUNTIES,
	bountyDefinition
};
