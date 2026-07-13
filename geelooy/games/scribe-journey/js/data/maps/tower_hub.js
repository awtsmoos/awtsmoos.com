// B"H
// Boruch Hashem
// Blessed is He

export const towerHubMaps = {
	tower_lobby: {
		width: 15,
		baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜1️⃣⬜2️⃣⬜3️⃣⬜4️⃣⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱`,
		interactables: {
			exit: { type: 'door', uu: '\ufd86', visual: '🚪', x: 1, y: 6, targetMap: 'malkuth_village', targetX: 7, targetY: 6 },
			start_climb: { type: 'door', uu: '\ufd84', visual: '🆙', x: 7, y: 4, targetMap: 'tower_floor_1', targetX: 7, targetY: 7 },
			feature_npc: { type: 'npc', uu: '\ufd81', visual: '🔢', x: 2, y: 2, dialogue: { start: ['The Infinite Loop names every feature so none are erased.'] } },
			feature_npc_east: { type: 'npc', uu: '\ufd82', visual: '🔢', x: 12, y: 2, dialogue: { start: ['Every floor is distinct, even when the climb rhymes.'] } },
			glitch_west: { type: 'npc', uu: '\ufd83', visual: '👾', x: 2, y: 4, dialogue: { start: ['A glitch admits it once stole identities.'] } },
			glitch_east: { type: 'npc', uu: '\ufd85', visual: '👾', x: 12, y: 4, dialogue: { start: ['The second glitch keeps its own name.'] } },
			east_exit: { type: 'door', uu: '\ufd87', visual: '🚪', x: 13, y: 6, targetMap: 'malkuth_village', targetX: 7, targetY: 6 }
		}
	}
};
