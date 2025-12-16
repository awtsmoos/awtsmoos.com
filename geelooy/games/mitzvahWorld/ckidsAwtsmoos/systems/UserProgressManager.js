
// B"H
import Utils from "../utils.js";

export default class UserProgressManager {
    constructor(olam) {
        this.olam = olam;
        // Default Data Structure
        this.data = {
            inventory: { slots: [], equipment: {} },
            questHistory: {}, // { questId: { status, timestamp, count } }
            unlockedRecipes: [],
            stats: { coinsCollected: 0 }
        };
        
        this._saveTimeout = null;
        this.load();
    }

    load() {
        // B"H: Load from playerSettings passed during Olam initialization
        // This data originates from worldManager.js via systemInfo.set.playerSettings
        if (this.olam && this.olam.playerSettings) {
            try {
                // Merge loaded settings with default structure to ensure robustness
                // We use deep merge logic if needed, but for now top-level merge is okay 
                // provided we check sub-objects.
                const loaded = this.olam.playerSettings;
                
                if(loaded.inventory) this.data.inventory = loaded.inventory;
                if(loaded.questHistory) this.data.questHistory = loaded.questHistory;
                if(loaded.stats) this.data.stats = loaded.stats;
                
                console.log("B\"H UserProgressManager: Loaded settings from Olam.");
            } catch (e) {
                console.warn("B\"H UserProgressManager: Error merging settings", e);
            }
        } else {
             console.log("B\"H UserProgressManager: No saved settings found, starting fresh.");
        }
    }

    save() {
        // B"H: Debounce save to prevent network spam (e.g. "makeFile" flooding)
        if (this._saveTimeout) {
            clearTimeout(this._saveTimeout);
        }

        this._saveTimeout = setTimeout(() => {
            this._performSave();
        }, 2000); // Save at most once every 2 seconds
    }

    async _performSave() {
        // 1. Sync live inventory state to local data object
        if (this.olam.player && this.olam.player.inventory) {
            this.data.inventory = {
                slots: this.olam.player.inventory.slots,
                actionSlots: this.olam.player.inventory.actionSlots,
                equipment: this.olam.player.inventory.equipment
            };
        }

        // 2. Persist to Server if Logged In
        const alias = this.olam.curAlias;
        if (alias) {
            try {
                const settingsPath = "desktop.folder/game data.folder/playerData.json";
                const fileContent = JSON.stringify(this.data, null, 2);

                // Fire and forget save
                fetch(`/api/social/aliases/${alias}/fileSystem/makeFile`, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        path: settingsPath,
                        value: fileContent
                    })
                }).then(res => {
                   if(!res.ok) console.warn("B\"H Auto-Save Failed", res.status);
                }).catch(e => console.warn("B\"H Auto-Save Error", e));
                
            } catch (e) {
                console.error("B\"H Error saving progress:", e);
            }
        }
    }

    // --- Quest Persistence ---
    
    getQuestState(questId) {
        return this.data.questHistory[questId] || null;
    }

    updateQuestState(questId, stateData) {
        if (!this.data.questHistory[questId]) {
            this.data.questHistory[questId] = { count: 0 };
        }
        
        const entry = this.data.questHistory[questId];
        Object.assign(entry, stateData);
        entry.lastUpdated = Date.now();
        
        if (stateData.status === 'COMPLETED') {
            entry.count = (entry.count || 0) + 1;
            entry.lastCompleted = Date.now();
        }
        
        this.save();
    }

    checkCooldown(questId, cooldownMinutes) {
        const entry = this.data.questHistory[questId];
        if (!entry || !entry.lastCompleted) return true; // Available
        
        const diff = Date.now() - entry.lastCompleted;
        return diff > (cooldownMinutes * 60 * 1000);
    }
}
