//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module WorldMemoryGraph
 * @description
 * People, places, items, and events remember one another as bounded typed edges.
 * The Awtsmoos remembers without limit; Awtsmoos.com preserves only the strongest
 * finite consequences so future dialogue and contracts can read what truly changed.
 */
export class WorldMemoryGraph {
	remember(state, memory) {
		validate(memory);
		const edge = {
			id: memory.id || `${memory.type}:${memory.sourceId}:${memory.targetId}:${state.actionCount}`,
			type: memory.type,
			sourceId: memory.sourceId,
			targetId: memory.targetId,
			summary: memory.summary,
			importance: clamp(memory.importance ?? 50),
			minute: state.clock.minute
		};
		const withoutDuplicate = state.memory.filter(item => item.id !== edge.id);
		const memoryEdges = [...withoutDuplicate, edge]
			.sort((first, second) => second.importance - first.importance || second.minute - first.minute)
			.slice(0, 80);
		return { ...state, memory: memoryEdges };
	}

	between(state, firstId, secondId) {
		return state.memory.filter(edge =>
			(edge.sourceId === firstId && edge.targetId === secondId) ||
			(edge.sourceId === secondId && edge.targetId === firstId)
		);
	}

	forEntity(state, entityId, limit = 6) {
		return state.memory
			.filter(edge => edge.sourceId === entityId || edge.targetId === entityId)
			.slice(0, limit);
	}

	summary(state) {
		const counts = {};
		for (const edge of state.memory) counts[edge.type] = (counts[edge.type] || 0) + 1;
		return { total: state.memory.length, counts, strongest: state.memory.slice(0, 5) };
	}
}

function validate(memory) {
	const allowed = ['aid', 'construction', 'trade', 'rescue', 'trust', 'discovery', 'care', 'promise'];
	if (!allowed.includes(memory.type) || !memory.sourceId || !memory.targetId || !memory.summary) {
		throw new Error('WorldMemoryGraph: typed source, target, and summary required');
	}
}

function clamp(value) {
	return Math.max(1, Math.min(100, Math.round(value)));
}
