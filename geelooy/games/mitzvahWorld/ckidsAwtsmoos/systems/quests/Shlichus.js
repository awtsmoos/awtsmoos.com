
// B"H
/**
 * @file Shlichus.js
 * Represents a single mission/quest instance.
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

export const QUEST_TYPE = {
    GATHER: 'GATHER',
    TALK: 'TALK',
    ACTION: 'ACTION',
    VISIT: 'VISIT'
};

export default class Shlichus {
    constructor(data, handler) {
        this.handler = handler;
        this.olam = handler.olam;
        this.data = data;
        this.on = data.on || {}; // Legacy callbacks

        this.id = data.id || Utils.generateID();
        this.title = data.title || data.shaym || "Unknown Mitzvah";
        this.shaym = this.title; // Legacy alias
        
        this.description = data.description || "";
        this.priority = data.priority || 1; 
        
        this.giverId = data.giverId;
        this.returnToId = data.returnToId || data.giverId;
        
        this.type = data.type || QUEST_TYPE.GATHER;
        this.requirements = data.requirements || {}; 
        
        this.timeLimit = data.timeLimit || 0; 
        this.rewards = data.rewards || []; 
        this.spawnItems = data.spawnItems || []; 
        this._spawnedInstances = [];
        this.onStart = data.onStart; 
        
        // Tracking
        this.totalCollectedObjects = data.totalCollectedObjects || 0;
        this.collected = data.collected || 0;
        this.completeText = data.completeText || "Mitzvah Complete!";
        this.progressDescription = data.progressDescription || "Progress";
        
        this.startTime = 0;
        this.lastUpdateTime = 0;
        this.state = QUEST_STATE.AVAILABLE;
    }

    collectItem() {
        if (this.state !== QUEST_STATE.ACTIVE) return;
        this.collected++;
        
        if (typeof(this.on.progress) === 'function') {
            this.on.progress(this.collected, this);
        }
        
        this.checkProgress();
    }

    initiate() {
        this.activate();
    }

    activate() {
        this.state = QUEST_STATE.ACTIVE;
        this.startTime = Date.now();
        this.spawnWorldItems();
        
        this.handler.progressManager.updateQuestState(this.id, { status: this.state, startTime: this.startTime });
        this.handler.notifyUpdate();
        
        if (typeof(this.on.creation) === 'function') {
            this.on.creation(this);
        } else {
            this.olam.ayshPeula("ui event", "effectsOverlay", { 
                text: "MISSION BEGUN: " + this.title, 
                color: this.priority >= 2 ? "#FFD700" : "#4cc9f0"
            });
            this.olam.playSound("awtsmoos://dingSound", { volume: 0.3 });
        }
    }

    spawnWorldItems() {
        if (!this.spawnItems || this.spawnItems.length === 0) return;
        
        this.spawnItems.forEach(itemDef => {
            const itemData = {
                id: itemDef.id || "quest_item_" + Utils.generateID(),
                className: itemDef.className || 'CollectableItem',
                name: itemDef.name || "Quest Object",
                isQuestItem: true,
                shlichusId: this.id,
                ...itemDef.itemData 
            };

            const opts = { ...itemDef, itemData, isQuestItem: true, shlichusId: this.id };
            opts.on = opts.on || {};
            opts.on.collected = (worldObject, collector) => {
                if (collector && collector.inventory) {
                    collector.inventory.addItem(itemData);
                    this.olam.ayshPeula("ui event", "effectsOverlay", { text: `Refined: ${itemData.name}`, color: "#FFFF00" });
                }
                setTimeout(() => this.checkProgress(), 100);
            };
            
            // Use Olam's addObject which handles dynamic import internally
            this.olam.addObject(itemDef.className || 'CollectableItem', opts).then(nivra => {
                if (nivra) this._spawnedInstances.push(nivra);
            });
        });
    }

    despawnWorldItems() {
        this._spawnedInstances.forEach(n => this.olam.sealayk(n));
        this._spawnedInstances = [];
    }

    checkProgress() {
        if (this.state !== QUEST_STATE.ACTIVE) return;
        let isComplete = false;

        const qType = (this.type || "").toUpperCase();

        if (qType === QUEST_TYPE.GATHER) {
            const inventory = this.olam.player.inventory;
            let hasAll = true;
            for (const [itemId, qtyNeeded] of Object.entries(this.requirements)) {
                const found = inventory.slots.find(s => s && (s.id.includes(itemId) || s.name === itemId));
                if ((found ? found.quantity : 0) < qtyNeeded) hasAll = false;
            }
            isComplete = hasAll;
        } 
        else {
            if (this.totalCollectedObjects > 0 && this.collected >= this.totalCollectedObjects) {
                isComplete = true;
            }
        }

        if (isComplete) {
            this.state = QUEST_STATE.READY_TO_TURN_IN;
            this.handler.notifyUpdate();
            
            this.olam.ayshPeula("ui event", "effectsOverlay", { 
                text: "MISSION READY FOR REDEMPTION", 
                color: "#00FF00" 
            });
            this.olam.playSound("awtsmoos://dingSound", { volume: 0.6 });
        }
        return isComplete;
    }

    finish() {
        this.complete();
    }

    complete() {
        if (this.state !== QUEST_STATE.READY_TO_TURN_IN) return;
        this.state = QUEST_STATE.COMPLETED;
        this.despawnWorldItems();
        
        if (this.rewards) {
            this.rewards.forEach(r => {
                this.olam.player.inventory.addItem(r);
            });
        }

        this.handler.progressManager.updateQuestState(this.id, { status: this.state });
        this.handler.notifyUpdate();

        if (typeof(this.on.complete) === 'function') {
            this.on.complete(this);
        } else if (typeof(this.on.finish) === 'function') {
            this.on.finish(this);
        }

        this.olam.ayshPeula("ui event", "effectsOverlay", { text: "MITZVAH COMPLETED!", effect: "transaction", color: "#bc13fe" });
        this.olam.playSound("awtsmoos://dingSound", { volume: 1.0 });
    }
}
