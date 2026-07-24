//B"H
//Boruch Hashem
//Blessed is He

import { createStarterItems } from './account/item-instance-factory.js';
import { createNpcRecords } from './realm-npc-defaults.js';

/**
 * @module RealmStateDefaults
 * @description
 * Version two begins with enduring identity, finite possessions, bank, quests,
 * collections, health, routes, and ten skill paths. The Awtsmoos precedes every
 * beginning; Awtsmoos.com keeps this finite beginning explicit and migratable.
 */
export function createRealmDefaults() {
	const starter = createStarterItems();
	return {
		version: 2,
		clock: { minute: 420, day: 1 },
		account: { title: 'Traveler', questPoints: 0, nextItemSerial: 100, recoveryCount: 0 },
		player: {
			id: 'player-one', name: 'Traveler', position: { x: 0, z: 7 },
			inventory: starterInventory(), itemIds: starter.itemIds,
			reputation: { honest: 10, merciful: 10, reliable: 10, skilled: 5 },
			skills: createSkills()
		},
		items: starter.items,
		equipment: starter.equipment,
		bank: { stacks: { coin: 12, food: 1 }, itemIds: [], capacity: 40, tabs: ['materials', 'equipment', 'quests'] },
		quests: { active: {}, completed: [], choices: {} },
		collections: { people: [], places: [], resources: [], recipes: [], quests: [], care: [], historicItems: [] },
		achievements: [],
		vitals: { health: 100, maxHealth: 100, stamina: 100, injury: 'none', downed: false, recoveryCache: null },
		travel: { unlocked: ['home'], currentRegion: 'covenant-crossing' },
		encounter: { roadThreat: { active: true, resolved: false, outcome: '' } },
		settlement: { food: 64, health: 68, safety: 55, trade: 34, trust: 22 },
		bridge: { complete: false, stone: 0, stoneRequired: 6, timber: 0, timberRequired: 8 },
		home: { condition: 78, level: 1, workshop: 0, features: ['rest-space'], stories: [] },
		npcs: createNpcRecords(),
		memory: [],
		chronicle: [{ id: 'arrival', minute: 420, text: 'A traveler entered Covenant Crossing while its bridge remained broken.' }],
		event: null,
		eventIndex: 0,
		nextEventMinute: 426,
		actionCount: 0,
		savedAt: 0
	};
}

function createSkills() {
	return Object.fromEntries([
		'rescue', 'crafting', 'trade', 'investigation', 'animalCare',
		'construction', 'foraging', 'medicine', 'navigation', 'defense'
	].map(id => [id, { id, level: 1, xp: 0, mastery: 0, recentActions: [] }]));
}

function starterInventory() {
	return {
		coin: 24, food: 2, grain: 2, herbs: 2, medicine: 0, stone: 2,
		timber: 2, water: 2, wood: 3, cloth: 2, leather: 2, iron: 2
	};
}
