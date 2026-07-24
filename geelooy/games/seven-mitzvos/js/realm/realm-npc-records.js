//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RealmNpcRecords
 * @description
 * Twelve named residents have professions, schedules, plans, needs, and continuous
 * destinations. The Awtsmoos knows each soul beyond records; Awtsmoos.com refuses
 * to reduce living neighbors to anonymous quest markers.
 */
export const NPC_SCHEDULES = Object.freeze({
	builder: [[-8, 1], [-2, -1], [3, -5]],
	physician: [[-5, 5], [0, 3], [4, 2]],
	merchant: [[5, 4], [7, 0], [2, 5]],
	farmer: [[8, 7], [10, 2], [6, 8]],
	investigator: [[3, -7], [0, -3], [5, 1]],
	caretaker: [[9, -5], [7, -8], [4, -4]],
	teacher: [[-4, 7], [-1, 5], [1, 7]],
	'caravan-leader': [[12, 0], [5, 0], [-2, 0]],
	engineer: [[-1, -2], [0, -1], [1, -2]],
	veterinarian: [[8, -6], [6, -4], [10, -7]],
	guard: [[-10, 0], [0, 0], [10, 0]],
	guide: [[0, 6], [2, 2], [-2, 3]]
});

export function npcSchedule(role) {
	return NPC_SCHEDULES[role] || [[0, 0]];
}

export function npcDialogue(npc, state) {
	const memories = npc.memories?.slice(-2).map(memory => memory.summary).join(' ') || '';
	const bridge = state.bridge.complete ? 'The reopened bridge has changed every plan.' : 'Everyone is waiting for the bridge.';
	return `${npc.name}, ${npc.role}: ${npc.plan}. ${bridge}${memories ? ` ${memories}` : ''}`;
}
