//B"H
//Boruch Hashem
//Blessed is He

import { createRealmDefaults } from './realm-state-defaults.js';

/**
 * @module RealmStateMigration
 * @description
 * Old civic memories cross into account identity without erasure. The Awtsmoos
 * renews old and new together; Awtsmoos.com preserves bridge, home, people, skills,
 * inventory, chronology, and events while adding every version-two covenant law.
 */
export function migrateRealmState(value) {
	const fresh = createRealmDefaults();
	if (!value || typeof value !== 'object') return fresh;
	const items = { ...fresh.items, ...(value.items || {}) };
	const itemIds = validIds(value.player?.itemIds || fresh.player.itemIds, items);
	const bankItemIds = validIds(value.bank?.itemIds || [], items).filter(id => !itemIds.includes(id));
	const equipment = normalizeEquipment(value.equipment, fresh.equipment, itemIds);
	return {
		...fresh,
		...value,
		version: 2,
		account: { ...fresh.account, ...value.account },
		player: {
			...fresh.player,
			...value.player,
			position: { ...fresh.player.position, ...value.player?.position },
			inventory: { ...fresh.player.inventory, ...value.player?.inventory },
			itemIds,
			reputation: { ...fresh.player.reputation, ...value.player?.reputation },
			skills: mergeSkills(fresh.player.skills, value.player?.skills)
		},
		items,
		equipment,
		bank: {
			...fresh.bank,
			...value.bank,
			stacks: { ...fresh.bank.stacks, ...value.bank?.stacks },
			itemIds: bankItemIds,
			tabs: unique(value.bank?.tabs || fresh.bank.tabs).slice(0, 8)
		},
		quests: {
			...fresh.quests,
			...value.quests,
			active: { ...value.quests?.active },
			completed: unique(value.quests?.completed || []).slice(-30),
			choices: { ...value.quests?.choices }
		},
		collections: normalizeCollections(fresh.collections, value.collections),
		achievements: unique(value.achievements || []).slice(-40),
		vitals: { ...fresh.vitals, ...value.vitals },
		travel: {
			...fresh.travel,
			...value.travel,
			unlocked: unique([...(value.travel?.unlocked || []), 'home']).slice(-20)
		},
		encounter: {
			...fresh.encounter,
			...value.encounter,
			roadThreat: { ...fresh.encounter.roadThreat, ...value.encounter?.roadThreat }
		},
		settlement: { ...fresh.settlement, ...value.settlement },
		bridge: { ...fresh.bridge, ...value.bridge },
		home: { ...fresh.home, ...value.home },
		npcs: Array.isArray(value.npcs) ? value.npcs.slice(0, 12) : fresh.npcs,
		memory: Array.isArray(value.memory) ? value.memory.slice(-80) : [],
		chronicle: Array.isArray(value.chronicle) ? value.chronicle.slice(-24) : fresh.chronicle
	};
}

function mergeSkills(defaults, saved = {}) {
	return Object.fromEntries(Object.entries(defaults).map(([id, base]) => [
		id,
		{ ...base, ...(saved[id] || {}), recentActions: [...(saved[id]?.recentActions || [])].slice(-6) }
	]));
}

function normalizeEquipment(saved = {}, defaults, itemIds) {
	return Object.fromEntries(Object.keys(defaults).map(slot => {
		const candidate = saved[slot] === undefined ? defaults[slot] : saved[slot];
		return [slot, itemIds.includes(candidate) ? candidate : null];
	}));
}

function normalizeCollections(defaults, saved = {}) {
	return Object.fromEntries(Object.keys(defaults).map(key => [key, unique(saved[key] || []).slice(-40)]));
}

function validIds(values, items) {
	return unique(values).filter(id => items[id]);
}

function unique(values) {
	return [...new Set(Array.isArray(values) ? values : [])];
}
