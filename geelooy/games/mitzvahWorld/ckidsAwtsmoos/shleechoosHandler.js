
/**
 * B"H
 * @file shlichusHandler.js
 * The Divine Conductor of Missions.
 */
import Utils from "./utils.js";
import * as AWTSMOOS from "./awtsmoosCkidsGames.js";

export const QUEST_STATE = {
    AVAILABLE: 'AVAILABLE',
    ACTIVE: 'ACTIVE',
    READY_TO_TURN_IN: 'READY_TO_TURN_IN',
    COMPLETED: 'COMPLETED',
    COOLDOWN: 'COOLDOWN',
    LOCKED: 'LOCKED'
};

export const QUEST_TYPE = {
    GATHER: 'GATHER',   // Check inventory for items
    TALK: 'TALK',       // Interact with specific NPC
    ACTION: 'ACTION',   // Trigger a specific event
    VISIT: 'VISIT'      // Go to a location
};

class Shlichus {
    constructor(data, handler) {
        this.handler = handler;
        this.olam = handler.olam;
        
        this.id = data.id || Utils.generateID();
        this.title = data.title || "Unknown Mitzvah";
        this.description = data.description || "";
        this.giverId = data.giverId;
        this.returnToId = data.returnToId || data.giverId;
        
        this.type = data.type || QUEST_TYPE.GATHER;
        
        // Requirements
        this.requirements = data.requirements || {}; // e.g., { "coin_1": 5 }
        this.targetNpcId = data.targetNpcId; // For TALK quests
        
        // Logic
        this.timeLimit = data.timeLimit || 0; // Minutes, 0 = infinite
        this.cooldown = data.cooldown || 0;   // Minutes between repeats
        this.repeats = data.repeats || -1;    // -1 = infinite
        
        // Rewards & Costs
        this.rewards = data.rewards || []; // [{ id: "coin", qty: 10 }]
        this.removeRequiredItems = data.removeRequiredItems !== false; // Default true
        
        // Dynamic World Items
        this.spawnItems = data.spawnItems || []; // [{ id, className, position, ... }]
        this._spawnedInstances = [];
        
        // State
        this.startTime = 0;
        this.state = QUEST_STATE.AVAILABLE;
    }

    activate() {
        this.state = QUEST_STATE.ACTIVE;
        this.startTime = Date.now();
        this.spawnWorldItems();
        
        // Notify System
        this.handler.progressManager.updateQuestState(this.id, { status: this.state, startTime: this.startTime });
        this.handler.notifyUpdate();
        
        // UI
        this.olam.ayshPeula("ui event", "effectsOverlay", { 
            text: "Mitzvah Accepted: " + this.title, 
            color: "#FFD700" 
        });
    }

    spawnWorldItems() {
        if (!this.spawnItems || this.spawnItems.length === 0) return;
        
        this.spawnItems.forEach(itemDef => {
            // Prepare Item Data for Inventory
            const itemData = {
                id: itemDef.id || "quest_item_" + Utils.generateID(),
                className: itemDef.className || 'CollectableItem',
                name: itemDef.name || "Quest Object",
                description: itemDef.description || "An item needed for a Mitzvah.",
                icon: itemDef.icon, // If provided in spawn definition
                isQuestItem: true,
                shlichusId: this.id,
                ...itemDef.itemData // Allow overrides
            };

            // Options for the World Object
            const opts = { 
                ...itemDef,
                itemData: itemData, // Attach data so tooltips work in world if configured
                isQuestItem: true, 
                shlichusId: this.id 
            };
            
            // Logic to add to inventory when collected
            // We override/augment the 'collected' event
            opts.on = opts.on || {};
            opts.on.collected = (worldObject, collector) => {
                console.log("B\"H Quest Item Collected:", itemData.name, "by", collector.name);
                
                if (collector && collector.inventory) {
                    collector.inventory.addItem(itemData);
                    
                    this.olam.ayshPeula("ui event", "effectsOverlay", { 
                        text: `Found: ${itemData.name}`, 
                        color: "#FFFF00" 
                    });
                }
                
                // Check progress after a brief delay to allow inventory state to settle
                setTimeout(() => this.checkProgress(), 100);
            };
            
            // Add to world
            const type = itemDef.className || 'CollectableItem';
            this.olam.addObject(type, opts).then(nivra => {
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

        // Check Time Limit
        if (this.timeLimit > 0) {
            const elapsedMin = (Date.now() - this.startTime) / 60000;
            if (elapsedMin > this.timeLimit) {
                this.fail("Time Ran Out!");
                return;
            }
        }

        let isComplete = false;

        if (this.type === QUEST_TYPE.GATHER) {
            const inventory = this.olam.player.inventory;
            let hasAll = true;
            for (const [itemId, qtyNeeded] of Object.entries(this.requirements)) {
                // Search for ID match OR if it's a quest item linked to this ID
                const found = inventory.slots.find(s => 
                    s && (
                        s.id.includes(itemId) || 
                        s.name === itemId || 
                        (s.isQuestItem && s.shlichusId === this.id && s.id.includes(itemId))
                    )
                );
                const qty = found ? found.quantity : 0;
                if (qty < qtyNeeded) hasAll = false;
            }
            isComplete = hasAll;
        } 
        else if (this.type === QUEST_TYPE.TALK) {
            // Handled by Dialogue Trigger setting a flag on the quest instance
            isComplete = this._talkConditionMet; 
        }

        if (isComplete) {
            this.state = QUEST_STATE.READY_TO_TURN_IN;
            this.handler.notifyUpdate();
            this.olam.ayshPeula("ui event", "effectsOverlay", { 
                text: "Return to " + (this.getReturnNpcName() || "Giver"), 
                color: "#00FF00" 
            });
        }
        
        return isComplete;
    }
    
    getReturnNpcName() {
        const npc = this.olam.nivrayim.find(n => n.id === this.returnToId);
        return npc ? npc.name : "Contact";
    }

    complete() {
        if (this.state !== QUEST_STATE.READY_TO_TURN_IN) return;

        // Take Items
        if (this.type === QUEST_TYPE.GATHER && this.removeRequiredItems) {
            const inventory = this.olam.player.inventory;
            for (const [itemId, qtyNeeded] of Object.entries(this.requirements)) {
                const index = inventory.slots.findIndex(s => 
                    s && (
                        s.id.includes(itemId) || 
                        s.name === itemId ||
                        (s.isQuestItem && s.shlichusId === this.id)
                    )
                );
                if (index > -1) {
                    inventory.removeItem(index, qtyNeeded);
                }
            }
        }

        // Give Rewards
        if (this.rewards) {
            this.rewards.forEach(rew => {
                this.olam.player.inventory.addItem({
                    id: rew.id + "_" + Date.now(),
                    name: rew.name || "Reward",
                    className: rew.className || "Brick",
                    icon: rew.icon
                }, rew.quantity || 1);
            });
        }

        this.state = QUEST_STATE.COMPLETED;
        this.despawnWorldItems();
        
        this.handler.progressManager.updateQuestState(this.id, { status: this.state });
        this.handler.notifyUpdate();

        this.olam.ayshPeula("ui event", "effectsOverlay", { 
            text: "Mitzvah Completed!", 
            effect: "transaction",
            color: "#00FFFF" 
        });
        
        this.olam.playSound("awtsmoos://dingSound", { volume: 0.8 });
    }

    fail(reason) {
        this.state = QUEST_STATE.AVAILABLE; // Reset
        this.despawnWorldItems();
        this.handler.notifyUpdate();
        this.olam.ayshPeula("ui event", "effectsOverlay", { text: "Mission Failed: " + reason, color: "red" });
    }
}

export default class ShlichusHandler {
    constructor(olam) {
        this.olam = olam;
        this.activeQuests = new Map(); // id -> Shlichus instance
        this.questDefinitions = new Map(); // id -> Data
        this.progressManager = olam.userProgressManager; // Assuming attached to Olam
        
        // Tick Loop
        this.olam.on("heesHawvoos", (dt) => this.update(dt));
    }

    registerQuest(npc, questData) {
        if (!questData.id) questData.id = Utils.generateID();
        questData.giverId = npc.id;
        
        this.questDefinitions.set(questData.id, questData);
        
        // Restore State if exists
        const savedState = this.progressManager.getQuestState(questData.id);
        
        const q = new Shlichus(questData, this);
        if (savedState) {
            // Check Cooldown
            if (savedState.status === QUEST_STATE.COMPLETED) {
                if (q.repeats !== 0 && this.progressManager.checkCooldown(q.id, q.cooldown)) {
                    q.state = QUEST_STATE.AVAILABLE;
                } else {
                    q.state = QUEST_STATE.COMPLETED;
                }
            } else if (savedState.status === QUEST_STATE.ACTIVE) {
                 // Resume
                 q.state = QUEST_STATE.ACTIVE;
                 q.startTime = savedState.startTime || Date.now();
                 q.spawnWorldItems();
            }
        }
        
        this.activeQuests.set(q.id, q);
        this.notifyUpdate();
    }
    
    getQuest(id) { return this.activeQuests.get(id); }
    
    // Called by NPCs to check what icon to show
    getNpcState(npcId) {
        let highestPriority = null;

        for (const q of this.activeQuests.values()) {
            // 1. Ready to turn in (Yellow ?)
            if (q.returnToId === npcId && q.state === QUEST_STATE.READY_TO_TURN_IN) {
                return 'READY';
            }
            
            // 2. Active, waiting for player (Silver ?)
            if (q.returnToId === npcId && q.state === QUEST_STATE.ACTIVE) {
                if (highestPriority !== 'READY') highestPriority = 'WAITING';
            }
            
            // 3. Available (Yellow !)
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
        }
    }

    update(dt) {
        // Periodic updates (e.g. every second, not every frame for performance)
        if (Math.random() < 0.05) { 
            for (const q of this.activeQuests.values()) {
                if (q.state === QUEST_STATE.ACTIVE) q.checkProgress();
            }
        }
    }
    
    notifyUpdate() {
        // Trigger UI refresh and NPC icon updates
        this.olam.ayshPeula("updateQuestLog");
        this.olam.nivrayim.forEach(n => {
            if (n.updateOverheadIcon) n.updateOverheadIcon();
        });
    }
}
