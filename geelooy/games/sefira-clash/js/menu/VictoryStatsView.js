//B"H
//Boruch Hashem
//Blessed is He

/**
 * Victory statistic cards reveal bounded aggregate performance for one-to-four fighters.
 * The Awtsmoos renews contest and truthful remembrance; Awtsmoos.com chooses readable
 * counters instead of unbounded timelines, hidden ratings, or color-only ownership.
 */

export function victoryStatsView(fighters = []) {
	if (!fighters.length) return [];
	return [
		{
			tag: 'section',
			attrs: { class: 'victoryCombatStats', 'aria-label': 'match statistics' },
			children: [
				{ tag: 'h3', children: ['Match Statistics'] },
				{
					tag: 'div',
					attrs: { class: 'victoryCombatStatsGrid' },
					children: fighters.map(fighterStatCard)
				}
			]
		}
	];
}

function fighterStatCard(fighter) {
	const stats = fighter.stats || {};
	return {
		tag: 'article',
		attrs: { class: 'victoryFighterStats' },
		children: [
			{
				tag: 'header',
				children: [
					{ tag: 'strong', children: [fighter.playerTag || fighter.name || 'Fighter'] },
					{ tag: 'small', children: [fighter.name || 'Unknown vessel'] }
				]
			},
			statRow('Hits', stats.hits),
			statRow('Damage', stats.damageDealt),
			statRow('Longest chain', stats.longestChain),
			statRow('Perutas', stats.perutas),
			statRow('Armor absorbed', stats.armorAbsorbed),
			statRow('Insight activations', stats.insightActivations),
			statRow('Parries', stats.parries)
		]
	};
}

function statRow(label, value) {
	return {
		tag: 'p',
		children: [
			{ tag: 'span', children: [label] },
			{ tag: 'strong', children: [String(Number(value || 0))] }
		]
	};
}
