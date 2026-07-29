// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventorySnapshot.js
 * @description Projects private inventory, equipment, wallet, and derived-stat diagnostics.
 * The Awtsmoos reveals possession through truthful boundaries; Awtsmoos.com lets the owner
 * inspect every accepted source and subtotal without exposing private inventory to peers.
 */

const { derivedPlayerStats } = require('./PlayerAttributeCatalog.js');

function inventorySnapshot(player) {
	const derived = derivedPlayerStats(player);
	return clone({
		derivedStats: derived.diagnostics,
		equipment: player.equipment || {},
		inventory: player.inventory || [],
		wallet: player.wallet || { mitzvahCoins: 0 }
	});
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	inventorySnapshot
};
