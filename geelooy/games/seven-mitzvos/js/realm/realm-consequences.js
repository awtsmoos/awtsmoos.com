//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RealmConsequences
 * @description
 * Successful actions change reputation, NPC trust, and bounded history exactly
 * once. The Awtsmoos joins every deed with its truth; Awtsmoos.com keeps domain
 * changes separate so one rest or rescue never writes duplicate chronicle entries.
 */
export function appendChronicle(state, text) {
	return {
		...state,
		chronicle: [...state.chronicle, {
			id: `chronicle-${state.actionCount}-${state.clock.minute}`,
			minute: state.clock.minute,
			text
		}].slice(-24)
	};
}

export function improveReputation(state, field, amount = 1) {
	const reputation = {
		...state.player.reputation,
		[field]: Math.min(100, (state.player.reputation[field] || 0) + amount)
	};
	return { ...state, player: { ...state.player, reputation } };
}

export function trustNpc(state, npcId, summary, amount = 2) {
	const npcs = state.npcs.map(npc => npc.id === npcId
		? {
			...npc,
			trust: Math.min(100, npc.trust + amount),
			memories: [...npc.memories, {
				type: 'aid',
				summary,
				minute: state.clock.minute
			}].slice(-6)
		}
		: npc);
	return { ...state, npcs };
}

export function restAtHome(state) {
	return {
		...state,
		home: { ...state.home, condition: Math.min(100, state.home.condition + 2) },
		settlement: { ...state.settlement, health: Math.min(100, state.settlement.health + 1) }
	};
}
