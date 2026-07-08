
import Shlichus, { QUEST_STATE } from "./systems/quests/Shlichus.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import ProgressTracker from "./systems/quests/ProgressTracker.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import ShlichusActions from "./systems/quests/ShlichusActions.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * @file shleechoosHandler.js
 * @description
 * THE MASTER OF MISSIONS (GABBAI)
 * 
 * Chapter 100: THE DISTRIBUTION OF DUTIES
 * 
 * The Gabbai oversees the entire congregation of tasks.
 * This handler now uses the modular ProgressTracker to evaluate
 * souls and the ShlichusActions to speak to the UI.
 * It is perfectly synchronized with the NPC visual state.
 */

export default class ShlichusHandler {
    constructor(olam) {
        this.olam = olam;
        this.activeQuests = new Map();
        this.progressManager = olam.userProgressManager;
        
        // B"H: The heartbeat of checking progress
        this.olam.on("heesHawvoos", (dt) => this.update(dt));
    }

    registerQuest(npc, questData) {
        const quest = new Shlichus(questData, this);
        quest.giverId = npc.id;
        this.activeQuests.set(quest.id, quest);
        
        // Restore from Zikaron (Memory)
        const saved = this.progressManager.getQuestState(quest.id);
        if (saved) {
            quest.state = saved.status;
            if (quest.state === QUEST_STATE.ACTIVE) quest.spawnWorldItems();
        }

        this.notifyUpdate();
    }

    getQuest(id) { return this.activeQuests.get(id); }
    getShlichusByShaym(nm) {
        for (const q of this.activeQuests.values()) {
            if (q.title === nm || q.shaym === nm) return q;
        }
        return null;
    }

    acceptQuest(id) {
        const q = this.getQuest(id);
        if (q && q.state === QUEST_STATE.AVAILABLE) {
            q.activate();
            this.notifyUpdate();
        }
    }

    update(dt) {
        // Optimization: Don't check every frame, only 5% of pulses
        if (Math.random() < 0.05) {
            for (const q of this.activeQuests.values()) {
                if (q.state === QUEST_STATE.ACTIVE) {
                    const isDone = ProgressTracker.check(q, this.olam.player.inventory);
                    if (isDone && q.state !== QUEST_STATE.READY_TO_TURN_IN) {
                        q.state = QUEST_STATE.READY_TO_TURN_IN;
                        this.notifyUpdate();
                    }
                }
            }
        }
    }

    notifyUpdate() {
        // 1. Alert the souls (NPCs) to change their icons
        this.olam.nivrayim.forEach(n => {
            if (n.updateOverheadIcon) n.updateOverheadIcon();
        });

        // 2. Alert the physical interface (UI)
        this.olam.ayshPeula("updateQuestLog");
    }

    getNpcState(npcId) {
        let best = null;
        for (const q of this.activeQuests.values()) {
            if (q.state === QUEST_STATE.COMPLETED) continue;
            if (q.returnToId === npcId && q.state === QUEST_STATE.READY_TO_TURN_IN) return 'READY';
            if (q.returnToId === npcId && q.state === QUEST_STATE.ACTIVE) best = 'WAITING';
            if (q.giverId === npcId && q.state === QUEST_STATE.AVAILABLE) {
                if (!best) best = 'AVAILABLE';
            }
        }
        return best;
    }
}
