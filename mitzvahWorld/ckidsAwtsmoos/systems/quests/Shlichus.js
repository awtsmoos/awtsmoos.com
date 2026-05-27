
// B"H
/**
 * @file Shlichus.js
 * Represents a single mission instance in the Olam.
 * A task given to the soul to elevate the physical into the spiritual.
 */
import Utils from "../../utils.js";

export const QUEST_STATE = {
    AVAILABLE: 'AVAILABLE',
    ACTIVE: 'ACTIVE',
    READY_TO_TURN_IN: 'READY_TO_TURN_IN',
    COMPLETED: 'COMPLETED',
    COOLDOWN: 'COOLDOWN',
    LOCKED: 'LOCKED'
};

export default class Shlichus {
    constructor(data, handler) {
        this.handler = handler;
        this.olam = handler.olam;
        this.data = data;

        this.id = data.id || Utils.generateID();
        this.title = data.title || data.shaym || "Mitzvah Opportunity";
        this.description = data.description || "A task to bring light.";
        
        this.priority = data.priority || 1; 
        
        this.timeLimitRaw = data.timeLimit || 0; 
        this.expiresAt = 0; 

        this.giverId = data.giverId;
        this.returnToId = data.returnToId || data.giverId;
        
        this.requirements = data.requirements || {}; 
        this.rewards = data.rewards || []; 
        this.spawnItems = data.spawnItems || []; 
        this._spawnedInstances = [];
        
        this.collected = data.collected || 0;
        this.totalCollectedObjects = data.totalCollectedObjects || 0;
        
        this.state = QUEST_STATE.AVAILABLE;
        this.manualCompletionRequested = false;
    }

    activate() {
        this.state = QUEST_STATE.ACTIVE;
        this.startTime = Date.now();
        
        if (this.timeLimitRaw > 0) {
            this.expiresAt = this.startTime + (this.timeLimitRaw * 60000);
        }

        this.spawnWorldItems();
        this.handler.progressManager.updateQuestState(this.id, { 
            status: this.state, 
            startTime: this.startTime,
            expiresAt: this.expiresAt
        });
        this.handler.notifyUpdate();
        
        this.olam.ayshPeula("ui event", "effectsOverlay", { 
            text: "MISSION BEGUN: " + this.title, 
            color: this.priority >= 3 ? "#bc13fe" : "#FFD700"
        });
    }

    markAsComplete() {
        if (this.state !== QUEST_STATE.ACTIVE) return;
        this.manualCompletionRequested = true;
        this.checkProgress();
    }

    checkProgress() {
        if (this.state !== QUEST_STATE.ACTIVE) return;

        if (this.expiresAt > 0 && Date.now() > this.expiresAt) {
            this.fail("Time for this Mitzvah has passed.");
            return;
        }

        let isComplete = false;

        if (Object.keys(this.requirements).length > 0) {
            const inventory = this.olam.player.inventory;
            let hasAll = true;
            for (const [itemId, qtyNeeded] of Object.entries(this.requirements)) {
                const found = inventory.slots.find(s => s && (s.id.includes(itemId) || s.name === itemId));
                if ((found ? found.quantity : 0) < qtyNeeded) hasAll = false;
            }
            isComplete = hasAll;
        } 
        
        if (this.totalCollectedObjects > 0 && this.collected >= this.totalCollectedObjects) {
            isComplete = true;
        }

        if (this.manualCompletionRequested) {
            isComplete = true;
        }

        if (isComplete) {
            this.state = QUEST_STATE.READY_TO_TURN_IN;
            this.handler.notifyUpdate();
            this.olam.ayshPeula("ui event", "effectsOverlay", { 
                text: "MITZVAH READY", 
                color: "#00FF00" 
            });
        }
    }

    complete() {
        if (this.state !== QUEST_STATE.READY_TO_TURN_IN) return;
        this.state = QUEST_STATE.COMPLETED;
        this.despawnWorldItems();
        
        if (this.rewards) {
            this.rewards.forEach(r => this.olam.player.inventory.addItem(r));
        }

        this.handler.progressManager.updateQuestState(this.id, { status: this.state });
        this.handler.notifyUpdate();
        this.olam.ayshPeula("ui event", "effectsOverlay", { text: "MISSION SUCCESS", color: "#bc13fe" });
    }

    fail(reason) {
        this.state = QUEST_STATE.AVAILABLE; 
        this.despawnWorldItems();
        this.handler.notifyUpdate();
        this.olam.ayshPeula("ui event", "effectsOverlay", { text: reason, color: "red" });
    }

    spawnWorldItems() {
        this.spawnItems.forEach(itemDef => {
            this.olam.addObject(itemDef.className, { ...itemDef, shlichusId: this.id }).then(n => {
                if (n) this._spawnedInstances.push(n);
            });
        });
    }

    despawnWorldItems() {
        this._spawnedInstances.forEach(n => this.olam.sealayk(n));
        this._spawnedInstances = [];
    }
}
