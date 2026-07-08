// B"H
/**
 * @file ShlichusHandler.js
 * The overseer of all spiritual missions within the Olam.
 * Bridges the Divine Will (Blueprint) with the active service of the souls.
 */
import Shlichus, { QUEST_STATE } from "./Shlichus.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class ShlichusHandler {
    constructor(olam) {
        this.olam = olam;
        this.activeQuests = new Map(); 
        this.progressManager = olam.userProgressManager; 
    }

    /**
     * registerQuest - Introduces a new potentiality to the world.
     */
    registerQuest(npc, questData) {
        const q = new Shlichus(questData, this);
        this.activeQuests.set(q.id, q);
        this.notifyUpdate();
    }

    /**
     * getNpcState - Determines the spiritual availability of an NPC.
     * Maps the state of missions associated with a soul to visual indicators.
     * @param {string} npcId 
     * @returns {string|null} 'READY', 'WAITING', 'AVAILABLE', or null.
     */
    getNpcState(npcId) {
        let currentState = null;
        for (const q of this.activeQuests.values()) {
            if (q.state === QUEST_STATE.COMPLETED) continue;

            // Priority 1: Ready to turn in (Completion is imminent)
            if (q.returnToId === npcId && q.state === QUEST_STATE.READY_TO_TURN_IN) {
                return 'READY';
            }

            // Priority 2: In progress (The soul is waiting for the player)
            if (q.returnToId === npcId && q.state === QUEST_STATE.ACTIVE) {
                currentState = 'WAITING';
            }

            // Priority 3: Available to start (A new potentiality)
            if (q.giverId === npcId && q.state === QUEST_STATE.AVAILABLE) {
                if (currentState !== 'WAITING') currentState = 'AVAILABLE';
            }
        }
        return currentState;
    }

    /**
     * getShlichusByID - Retrieves a mission vessel by its unique spiritual ID.
     */
    getShlichusByID(id) {
        return this.activeQuests.get(id) || null;
    }

    /**
     * getShlichusByShaym - Locates a mission by its Holy Name.
     */
    getShlichusByShaym(shaym) {
        for (const q of this.activeQuests.values()) {
            if (q.title === shaym || q.shaym === shaym) return q;
        }
        return null;
    }

    /**
     * getSortedQuests - Returns a list of missions ordered by the requested quality.
     */
    getSortedQuests(sortBy = 'PRIORITY') {
        const list = Array.from(this.activeQuests.values());
        
        switch(sortBy) {
            case 'PRIORITY':
                return list.sort((a, b) => b.priority - a.priority);
            case 'DATE':
                return list.sort((a, b) => (a.expiresAt || Infinity) - (b.expiresAt || Infinity));
            case 'TITLE':
                return list.sort((a, b) => a.title.localeCompare(b.title));
            default:
                return list;
        }
    }

    acceptQuest(questId) {
        const q = this.activeQuests.get(questId);
        if (q) q.activate();
    }

    update(dt) {
        // Periodic check for expiration or automated completion
        if (Math.random() < 0.02) {
            this.activeQuests.forEach(q => q.checkProgress());
        }
    }

    notifyUpdate() {
        // Sync with the physical UI
        this.olam.ayshPeula("updateQuestLog");
    }
}
