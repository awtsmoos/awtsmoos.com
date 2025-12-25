
/**
 * B"H
 * @file ShlichusHandler.js
 * The Manager of Quests.
 */
import Utils from "../../utils.js";
import Shlichus, { QUEST_STATE } from "./Shlichus.js";

export default class ShlichusHandler {
    constructor(olam) {
        this.olam = olam;
        this.activeQuests = new Map(); // id -> Shlichus instance
        this.questDefinitions = new Map(); // id -> Data
        this.progressManager = olam.userProgressManager; 
        
        this.olam.on("heesHawvoos", (dt) => this.update(dt));
    }

    registerQuest(npc, questData) {
        if (!questData.id) questData.id = Utils.generateID();
        questData.giverId = npc.id;
        
        this.questDefinitions.set(questData.id, questData);
        
        const savedState = this.progressManager.getQuestState(questData.id);
        
        const q = new Shlichus(questData, this);
        if (savedState) {
            if (savedState.status === QUEST_STATE.COMPLETED) {
                if (q.repeats !== 0 && this.progressManager.checkCooldown(q.id, q.cooldown)) {
                    q.state = QUEST_STATE.AVAILABLE;
                } else {
                    q.state = QUEST_STATE.COMPLETED;
                }
            } else if (savedState.status === QUEST_STATE.ACTIVE) {
                 q.state = QUEST_STATE.ACTIVE;
                 q.startTime = savedState.startTime || Date.now();
                 q.spawnWorldItems();
            }
        }
        
        this.activeQuests.set(q.id, q);
        this.notifyUpdate();
    }
    
    // B"H: New Method for finding quests by name/shaym (Loose Coupling)
    getShlichusByShaym(shaym) {
        for (const q of this.activeQuests.values()) {
            if (q.title === shaym || q.id === shaym) return q;
        }
        return null;
    }
    
    getQuest(id) { return this.activeQuests.get(id); }
    
    getNpcState(npcId) {
        let highestPriority = null;

        for (const q of this.activeQuests.values()) {
            if (q.returnToId === npcId && q.state === QUEST_STATE.READY_TO_TURN_IN) {
                return 'READY';
            }
            if (q.returnToId === npcId && q.state === QUEST_STATE.ACTIVE) {
                if (highestPriority !== 'READY') highestPriority = 'WAITING';
            }
            if (q.giverId === npcId && q.state === QUEST_STATE.AVAILABLE) {
                if (!highestPriority) highestPriority = 'AVAILABLE';
            }
        }
        return highestPriority;
    }

    acceptQuest(questId) {
        const q = this.activeQuests.get(questId);
        if (q && q.state === QUEST_STATE.AVAILABLE) {
            q.activate();
            // B"H: Hook for custom onStart logic defined in quest file
            if (q.onStart) q.onStart(q);
        }
    }

    update(dt) {
        if (Math.random() < 0.05) { 
            for (const q of this.activeQuests.values()) {
                if (q.state === QUEST_STATE.ACTIVE) q.checkProgress();
            }
        }
    }
    
    notifyUpdate() {
        this.olam.ayshPeula("updateQuestLog");
        this.olam.nivrayim.forEach(n => {
            if (n.updateOverheadIcon) n.updateOverheadIcon();
        });
    }
}
