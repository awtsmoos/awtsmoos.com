//B"H
//Boruch Hashem
//Blessed is He

import { itemDefinition } from './item-catalog.js';
import { QUEST_CATALOG } from './quest-catalog.js';

/**
 * @module AccountFormatters
 * @description
 * State becomes short human records without hiding maker, material, provenance, or
 * wear. The Awtsmoos exceeds language; Awtsmoos.com gives every finite coat, quest,
 * banked tool, injury, and route enough truthful words to guide responsible action.
 */
export function itemRecord(state, itemId) {
	const instance = state.items[itemId];
	const definition = instance ? itemDefinition(instance.definitionId) : null;
	if (!definition) return { label: 'Unknown item', detail: 'Missing catalogue record' };
	return {
		label: `${definition.name} · Q${instance.quality} · ${instance.durability}/${instance.maxDurability}`,
		detail: `${definition.material} · made by ${instance.maker} · ${instance.provenance}`
	};
}

export function equipmentRows(state) {
	return Object.entries(state.equipment).map(([slot, itemId]) => ({
		slot,
		itemId,
		...(itemId ? itemRecord(state, itemId) : { label: 'Empty', detail: 'No item equipped' })
	}));
}

export function carriedItems(state) {
	return state.player.itemIds.map(itemId => ({
		itemId,
		...itemRecord(state, itemId),
		equipped: Object.values(state.equipment).includes(itemId)
	}));
}

export function bankItems(state) {
	return state.bank.itemIds.map(itemId => ({ itemId, ...itemRecord(state, itemId) }));
}

export function questRows(state) {
	const active = Object.entries(state.quests.active).map(([id, progress]) => {
		const quest = QUEST_CATALOG[id];
		const step = quest.steps[progress.stepIndex];
		return { id, title: quest.title, status: `${step.text} · ${progress.stepProgress}/${step.count}` };
	});
	const available = Object.values(QUEST_CATALOG)
		.filter(quest => !state.quests.completed.includes(quest.id) && !state.quests.active[quest.id])
		.map(quest => ({ id: quest.id, title: quest.title, status: quest.summary, available: true }));
	const completed = state.quests.completed.map(id => ({ id, title: QUEST_CATALOG[id]?.title || id, status: 'Completed' }));
	return [...active, ...available, ...completed];
}

export function stackText(stacks) {
	return Object.entries(stacks).filter(([, amount]) => amount > 0).map(([id, amount]) => `${title(id)} ${amount}`).join(' · ') || 'Empty';
}

export function title(value) {
	return String(value).replace(/([A-Z])/g, ' $1').replaceAll('-', ' ').replace(/^./, letter => letter.toUpperCase());
}
