
import { AwtsmoosWorldRegistry } from '../levels/AwtsmoosWorldRegistry.js';
import { WorldManifestor } from './WorldManifestor.js';

/**
 * @class GameAwtsmoosController
 * @description
 * B"H
 * The highest level coordinator in the application architecture.
 * It receives desires from the UI (e.g., "Load this world")
 * and commands the core systems to fetch the blueprints and manifest them.
 * It is completely hollow of its own logic, serving only as the 
 * conduit between Will (Action) and Reality (Manifestation).
 */
export class GameAwtsmoosController {
    /**
     * @function initiateWorld
     * @description
     * B"H
     * Finds the blueprint in the registry and commands the manifestor.
     * 
     * @param {string} worldId - The string identifier of the desired world.
     * @returns {void}
     */
    static initiateWorld(worldId) {
        const blueprint = AwtsmoosWorldRegistry.getBlueprint(worldId);
        
        if (blueprint) {
            WorldManifestor.load(blueprint);
        } else {
            console.error(`B"H - Failed to load. The void remains empty for ID: ${worldId}`);
        }
    }
}
