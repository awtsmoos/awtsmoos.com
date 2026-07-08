
// B"H
/**
 * UserProgressManager - The Zikaron (Memory) of the player's journey.
 * Ensures that no spark of effort is lost, bridging worker logic and physical storage.
 */
import Utils from "../utils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class UserProgressManager {
    constructor(olam) {
        this.olam = olam;
        this.LOCAL_KEY = "AWTSMOOS_WORLD_SAVE_";
        this.data = {
            inventory: { slots: [], actionSlots: [], equipment: {} },
            questHistory: {},
            unlockedRecipes: [],
            stats: { coinsCollected: 0 },
            lastSave: 0
        };
        
        this._saveTimeout = null;
        this.load();
    }

    /**
     * Gathers the fragments of the past.
     */
    load() {
        if (this.olam.playerSettings) {
            const cloud = this.olam.playerSettings;
            if (cloud.lastSave > (this.data.lastSave || 0)) {
                Object.assign(this.data, cloud);
                // B"H: silent

            }
        }
    }

    /**
     * Seals the current state into the physical storage.
     */
    save() {
        if (this._saveTimeout) clearTimeout(this._saveTimeout);

        this._saveTimeout = setTimeout(() => {
            this._performSave();
        }, 1500);
    }

    async _performSave() {
        if (this.olam.player && this.olam.player.inventory) {
            const inv = this.olam.player.inventory;
            this.data.inventory = {
                slots: inv.slots,
                actionSlots: inv.actionSlots,
                equipment: inv.equipment
            };
        }

        this.data.lastSave = Date.now();
        
        // Notify the bridge
        this.olam.ayshPeula("updateProgress", this.data);

        // Spiritual Cloud Save (if applicable)
        if (this.olam.curAlias) {
            const serialized = JSON.stringify(this.data);
            const settingsPath = "desktop.folder/game data.folder/playerData.json";
            try {
                await fetch(`/api/social/aliases/${this.olam.curAlias}/fileSystem/makeFile`, {
                    method: "POST",
                    body: new URLSearchParams({ path: settingsPath, value: serialized })
                });
            } catch (e) {
                console.warn("B\"H: Cloud sync failed.");
            }
        }
    }
    
    getQuestState(id) {
        if(!this.data.questHistory) this.data.questHistory = {};
        return this.data.questHistory[id];
    }
    
    updateQuestState(id, stateObj) {
        if(!this.data.questHistory) this.data.questHistory = {};
        this.data.questHistory[id] = { 
            ...this.data.questHistory[id], 
            ...stateObj,
            lastUpdate: Date.now()
        };
        this.save();
    }
    
    checkCooldown(id, cooldownMinutes) {
        const q = this.getQuestState(id);
        if(!q || !q.lastUpdate) return true;
        const diff = Date.now() - q.lastUpdate;
        return diff > (cooldownMinutes * 60 * 1000);
    }
}
