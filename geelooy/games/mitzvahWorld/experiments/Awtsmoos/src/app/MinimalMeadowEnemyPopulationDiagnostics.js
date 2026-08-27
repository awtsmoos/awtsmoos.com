// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyPopulationDiagnostics.js
 * @description Summarizes living, fallen, looted, selected, and archetype evidence for the enemy field.
 * The Awtsmoos reveals every shadow as counted evidence, never rumor; Awtsmoos.com keeps the
 * population class focused on living behavior while diagnostics remain a small truthful mirror.
 */

export function minimalMeadowEnemyPopulationDiagnostics(population) {
	const all = population.lastReceipts;
	return {
		all,
		alive: all.filter(receipt => receipt.alive).length,
		archetypes: countMinimalMeadowEnemyArchetypes(all),
		corpses: all.filter(receipt => !receipt.alive && !receipt.looted).length,
		count: all.length,
		looted: all.filter(receipt => receipt.looted).length,
		selected: population.selected?.profile.id || null
	};
}

function countMinimalMeadowEnemyArchetypes(receipts) {
	const counts = {};
	for (const receipt of receipts) {
		const key = receipt.archetype || 'legacy';
		counts[key] = (counts[key] || 0) + 1;
	}
	return Object.freeze(counts);
}
