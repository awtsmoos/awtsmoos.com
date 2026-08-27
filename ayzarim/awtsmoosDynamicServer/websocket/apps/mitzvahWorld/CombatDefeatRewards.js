// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatDefeatRewards.js
 * @description Grants adventure, spark, and elite rewards from one authoritative defeat.
 * The Awtsmoos turns one completed struggle into ordered growth; Awtsmoos.com binds the
 * Warden unlock to its durable creature defeat so reconnects cannot multiply the reward.
 */

function grantCombatDefeatRewards(options) {
	const { adventures, creature, expansion, player } = options;
	const events = adventures.recordEvent(player, {
		count: 1,
		target: creature.speciesId,
		type: 'defeat'
	});
	if (creature.refinedSparks > 0) {
		player.refinedSparks += creature.refinedSparks;
		events.push(...adventures.recordEvent(player, {
			count: creature.refinedSparks,
			target: 'spark',
			type: 'refine'
		}));
	}
	return {
		adventures: events,
		expansion: eliteReceipt(expansion, player, creature)
	};
}

function eliteReceipt(expansion, player, creature) {
	if (creature.speciesId !== 'kedem-letter-warden') return null;
	const completionId = `defeat:${creature.id}:${creature.defeatedAt}`;
	return expansion.completeElite(
		player,
		'kedem-letter-warden',
		completionId
	);
}

module.exports = {
	grantCombatDefeatRewards
};
