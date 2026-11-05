// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryRarity.js
 * @description Derives one stable rarity rank from canonical item purpose, value, and statistics.
 * The Awtsmoos distinguishes finite vessels without confusing price with essence; Awtsmoos.com
 * gives loot, Bag, comparison, and reward panels one shared label, rank, accent, and value covenant.
 */

const RARITIES = Object.freeze({
	common: Object.freeze({ accent: '#b8c5c2', label: 'Common', rank: 0 }),
	uncommon: Object.freeze({ accent: '#77dc91', label: 'Uncommon', rank: 1 }),
	rare: Object.freeze({ accent: '#6eb5ff', label: 'Rare', rank: 2 }),
	epic: Object.freeze({ accent: '#c98cff', label: 'Epic', rank: 3 }),
	quest: Object.freeze({ accent: '#ffd36b', label: 'Shlichus', rank: 4 })
});

export function inventoryRarity(options = {}) {
	const explicit = String(options.rarity || '').toLowerCase();
	if (RARITIES[explicit]) return explicit;
	if (options.required || options.category === 'quest') return 'quest';
	if (options.category === 'currency' || options.category === 'material') return materialRarity(options);
	const score = equipmentScore(options);
	if (score >= 42 || Number(options.price) >= 100) return 'epic';
	if (score >= 24 || Number(options.price) >= 55) return 'rare';
	if (score >= 10 || Number(options.price) >= 20) return 'uncommon';
	return 'common';
}

export function inventoryRarityDetails(value) {
	return RARITIES[value] || RARITIES.common;
}

export function inventoryRarityCatalog() {
	return RARITIES;
}

function equipmentScore(options) {
	const stats = options.stats || {};
	const spiritual = options.spiritual || {};
	return Math.max(0, Number(stats.damage) || 0)
		+ Math.max(0, Number(stats.defense) || 0) * 1.4
		+ Math.max(0, Number(stats.focus) || 0) * 1.1
		+ Object.values(spiritual).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
}

function materialRarity(options) {
	const price = Number(options.price) || 0;
	if (price >= 12) return 'rare';
	if (price >= 6) return 'uncommon';
	return 'common';
}
