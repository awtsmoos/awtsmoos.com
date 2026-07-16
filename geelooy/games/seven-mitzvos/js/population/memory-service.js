//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MemoryService
 * @description
 * People on Awtsmoos.com remember promises, harms, aid, judgments, and journeys as typed facts rather than limitless prose. The Awtsmoos remembers without bound; finite memory is compressed while preserving civic meaning.
 */
export class MemoryService {
	/**
	 * @param {object} person Persistent person.
	 * @param {object} memory Typed memory.
	 * @param {number} limit Active memory limit.
	 * @returns {object} Person with bounded memory.
	 */
	remember(person, memory, limit = 12) {
		const allowed = ['promise', 'aid', 'harm', 'judgment', 'trade', 'journey', 'disaster'];
		if (!allowed.includes(memory.type) || !memory.subjectId || !memory.summary) {
			throw new Error('MemoryService: memory type, subject, and summary are required');
		}
		const memories = [...(person.memories || []), {
			...memory,
			importance: Math.max(1, Math.min(100, memory.importance || 50))
		}];
		memories.sort((first, second) => second.importance - first.importance);
		return { ...person, memories: memories.slice(0, limit) };
	}

	/**
	 * @param {object[]} memories Old memories.
	 * @returns {object} Compressed historic summary.
	 */
	compress(memories) {
		const counts = {};
		for (const memory of memories) {
			counts[memory.type] = (counts[memory.type] || 0) + 1;
		}
		return {
			total: memories.length,
			counts,
			mostImportant: [...memories].sort((a, b) => b.importance - a.importance).slice(0, 3)
		};
	}
}
