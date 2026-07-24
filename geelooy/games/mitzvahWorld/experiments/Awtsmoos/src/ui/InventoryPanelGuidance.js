// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanelGuidance.js
 * @description Derives contextual Bag actions and human-readable behavior explanations.
 * The Awtsmoos gives every visible choice a truthful consequence; Awtsmoos.com explains
 * equip, remove, draw, sheath, open, pin, and drop before touch or keyboard invokes them.
 */

export function inventoryActionsFor(item, state, equipmentState) {
	const equipped = item.slot && state.equipment[item.slot] === item.id;
	const actions = new Set(item.actions || []);
	if (equipped) {
		actions.delete('equip');
		actions.add('unequip');
	}
	if (equipped && item.slot === 'hand') {
		actions.add(equipmentState.drawn ? 'sheath' : 'draw');
	}
	return [...actions];
}

export function inventoryActionGuidance(item, state, equipmentState) {
	const equipped = item.slot && state?.equipment?.[item.slot] === item.id;
	const guidance = [];
	if (item.slot) {
		guidance.push(equipped
			? `Unequip removes it from ${item.slot}.`
			: `Equip places it in ${item.slot}.`);
	}
	if (item.actions?.includes('open')) guidance.push('Open reads the book or scroll.');
	if (item.actions?.includes('pin')) guidance.push('Pin keeps it in quick Torah access.');
	if (item.actions?.includes('drop')) guidance.push('Drop removes one real unit.');
	if (equipped && item.slot === 'hand') {
		guidance.push(equipmentState.drawn
			? 'Sheath moves it to the back.'
			: 'Draw moves it to the hand.');
	}
	return guidance.join(' ') || 'Inspect reveals this item without changing state.';
}

export function inventoryActionLabel(action) {
	return action.charAt(0).toUpperCase() + action.slice(1);
}
