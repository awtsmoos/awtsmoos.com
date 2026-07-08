
import Utils from "../../utils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * @file QuestItemSpawner.js
 * @description
 * Chapter 33: THE GATHERING OF SPARKS
 * 
 * "Gather the fragments that are left over, so that nothing is lost."
 * This module is responsible for the 'Yesh me-Ayin' (Something from Nothing)
 * manifestation of items required for a Shlichus. It places the items
 * in the 3D world and binds their collection events to the player's progress.
 */

export default class QuestItemSpawner {
    /**
     * @function spawn
     * @description Crystallizes a list of items into the 3D scene.
     * @param {Object} olam - The master world instance.
     * @param {string} questId - The mission this item belongs to.
     * @param {Array} itemDefinitions - Blueprints of the items to spawn.
     * @returns {Promise<Array>} List of spawned nivra instances.
     */
    static async spawn(olam, questId, itemDefinitions) {
        if (!itemDefinitions || !Array.isArray(itemDefinitions)) return [];

        const spawned = [];

        for (const def of itemDefinitions) {
            const itemData = {
                id: def.id || "quest_" + Utils.generateID(),
                className: def.className || "CollectableItem",
                name: def.name || "Holy Spark",
                description: def.description || "A fragment of the mission.",
                isQuestItem: true,
                shlichusId: questId,
                ...def.itemData
            };

            const options = {
                ...def,
                itemData,
                on: {
                    // B"H: The Act of Elevation (Collection)
                    collected: (item, collector) => {
                        if (collector.inventory) {
                            collector.inventory.addItem(itemData);
                            olam.ayshPeula("ui event", "effectsOverlay", { 
                                text: `+ ${itemData.name}`, 
                                color: "#00ffed" 
                            });
                        }
                        
                        // Check quest progress after a small heartbeat
                        setTimeout(() => {
                            const quest = olam.shlichusHandler.getQuest(questId);
                            if (quest) quest.checkProgress();
                        }, 50);
                    }
                }
            };

            const type = def.className || "CollectableItem";
            const nivra = await olam.addObject(type, options);
            if (nivra) spawned.push(nivra);
        }

        return spawned;
    }
}
