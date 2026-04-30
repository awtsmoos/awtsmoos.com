
import { EmeraldWorldBlueprint } from './blueprints/EmeraldWorld.js';
import { VillageWorldBlueprint } from './blueprints/VillageWorld.js';

/**
 * @class AwtsmoosWorldRegistry
 * @description
 * B"H
 * The archive of all possible realities in this realm.
 * Instead of hardcoding conditions or using switch statements
 * to figure out which world to load, we maintain a pure object
 * map. Finding a world is merely accessing its key.
 */
export class AwtsmoosWorldRegistry {
    /**
     * Map of world IDs to blueprints.
     * @private
     */
    static #worlds = {
        "emerald_world": EmeraldWorldBlueprint,
        "village_world": VillageWorldBlueprint
    };

    /**
     * @function getBlueprint
     * @description
     * B"H
     * Retrieves the specific permutation of data that makes up a world.
     * 
     * @param {string} worldId - The ID of the world.
     * @returns {Object|null} The world blueprint, or null if it doesn't exist.
     */
    static getBlueprint(worldId) {
        if (this.#worlds.hasOwnProperty(worldId)) {
            return this.#worlds[worldId];
        }
        console.error(`B"H - The world '${worldId}' is not found in the Sefer (Book) of Creations.`);
        return null;
    }
}
