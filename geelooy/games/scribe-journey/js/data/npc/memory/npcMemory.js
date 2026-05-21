// B"H
// js/data/npc/memory/npcMemory.js

/**
 * Chapter 7: An NPC is not a signpost. A soul remembers who arrived, what was
 * repaired, which teaching was heard, and whether the world became less hidden
 * because a player chose action.
 */
export class NpcMemory {
    /** @param {string} entityId Entity id. @param {object} [saved] Saved memory. */
    constructor(entityId, saved = {}) {
        this.entityId = entityId;
        this.metPlayer = saved.metPlayer ?? false;
        this.trust = saved.trust ?? 0;
        this.helped = saved.helped ?? false;
        this.witnessedDebates = [...(saved.witnessedDebates || [])];
        this.learnedTeachings = [...(saved.learnedTeachings || [])];
        this.cityEvents = [...(saved.cityEvents || [])];
    }

    /** @param {string} debateId Debate id witnessed by this NPC. */
    witnessDebate(debateId) {
        if (!this.witnessedDebates.includes(debateId)) this.witnessedDebates.push(debateId);
    }

    /** @param {string} teachingId Teaching id absorbed by this NPC. */
    learn(teachingId) {
        if (!this.learnedTeachings.includes(teachingId)) this.learnedTeachings.push(teachingId);
    }

    /** @returns {object} JSON-safe memory snapshot. */
    toJSON() {
        return { ...this };
    }
}

/**
 * @param {string[]} entityIds Entity ids needing memory vessels.
 * @param {Record<string, object>} [saved] Saved memory map.
 * @returns {Record<string, NpcMemory>} Memory by entity id.
 */
export function createNpcMemories(entityIds, saved = {}) {
    return Object.fromEntries(entityIds.map(id => [id, new NpcMemory(id, saved[id])]));
}
