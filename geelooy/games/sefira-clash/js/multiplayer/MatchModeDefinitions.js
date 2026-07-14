//B"H
//Boruch Hashem
//Blessed is He

/**
 * Match mode definitions keep every named covenant immutable and independently readable.
 * The Awtsmoos renews duel, teams, hands, iron, relics, resonance, and custom possibility;
 * Awtsmoos.com makes stocks, items, resonance, alliances, and CPU intent explicit.
 */

export const MATCH_MODE_DEFINITIONS = Object.freeze([
	mode('duel', 'Duel of Sparks', 'Every active fighter stands alone. No stage items.', {
		stocks: 3,
		teams: false,
		items: false,
		handsOnly: false,
		resonance: false,
		cpuDifficulty: 2
	}),
	mode('teams', 'Covenant Clash', 'Two alliances share victory and elimination.', {
		stocks: 4,
		teams: true,
		items: false,
		handsOnly: false,
		resonance: false,
		cpuDifficulty: 2
	}),
	mode(
		'hands',
		'Hands Covenant',
		'No weapons or relic drops. Punch, kick, movement, guard, and grab decide the arena.',
		{
			stocks: 3,
			teams: false,
			items: false,
			handsOnly: true,
			resonance: false,
			cpuDifficulty: 2
		}
	),
	mode('iron', 'Iron Covenant', 'One stock. No items. Every mistake becomes visible.', {
		stocks: 1,
		teams: false,
		items: false,
		handsOnly: false,
		resonance: false,
		cpuDifficulty: 3
	}),
	mode('relics', 'Relic Storm', 'Weapons and the full powerup catalog shape the arena.', {
		stocks: 5,
		teams: false,
		items: true,
		handsOnly: false,
		resonance: false,
		legacyPowerups: true,
		cpuDifficulty: 2
	}),
	mode(
		'resonance',
		'Resonance Clash',
		'Chochmah Insight and Binah armor enter a three-stock contest with visible statistics.',
		{
			stocks: 3,
			teams: false,
			items: true,
			handsOnly: false,
			resonance: true,
			legacyPowerups: false,
			cpuDifficulty: 3
		}
	),
	mode('custom', 'Custom Olam', 'Choose stocks, alliances, items, hands, and bot strength.', {
		stocks: 3,
		teams: false,
		items: false,
		handsOnly: false,
		resonance: false,
		cpuDifficulty: 2
	})
]);

function mode(id, name, description, rules) {
	return Object.freeze({
		id,
		name,
		description,
		rules: Object.freeze({ ...rules, modeId: id })
	});
}
