// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanelState.js
 * @description Derives aggregate Bag cards and compact truthful status text from store snapshots.
 * The Awtsmoos remains one while physical stacks multiply; Awtsmoos.com gathers each item ID
 * into one readable visual quantity without altering the real stack limits beneath the panel.
 */

export function aggregateInventoryStacks(state) {
	const aggregates = new Map();
	for (const stack of state.items || []) {
		const current = aggregates.get(stack.itemId);
		if (current) {
			current.quantity += stack.quantity;
			continue;
		}
		aggregates.set(stack.itemId, { ...stack });
	}
	return [...aggregates.values()];
}

export function combinedInventoryStack(state, itemId) {
	if (!itemId) return null;
	return aggregateInventoryStacks(state).find(stack => stack.itemId === itemId) || null;
}

export function inventorySummaryText(state) {
	const coins = combinedInventoryStack(state, 'perutas')?.quantity || 0;
	return [
		`🪙 ${coins}`,
		`⚔ ${state.stats.damage}`,
		`🛡 ${state.stats.defense}`,
		`✨ ${state.stats.focus}`
	].join(' · ');
}
