
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';
import NPCWanderSoul from '../../npc/NPCWanderSoul.js';

/**
 * B"H
 * @file NPCEntity.js
 * 
 * Chapter: The Chariots of the Mitzvahs.
 * NPCs are not mere decorations; they hold Shlichus (missions) and 
 * divine sparks. This class wraps the pure data `NPCWanderSoul` and 
 * provides it physical mass and presence in the 2D world grid.
 */

/**
 * @class NPCEntity
 * @extends SederHishtalshelusNode
 * @description A wandering physical manifestation of a localized intelligence.
 */
export default class NPCEntity extends SederHishtalshelusNode {
    /**
     * @param {string} id - Unique name.
     * @param {number} x - Start World X.
     * @param {number} y - Start World Y.
     */
    constructor(id, x, y) {
        super({ worldName: `Yetzirah_NPC_${id}` });
        
        this.id = id;
        this.color = '#facc15'; // Golden spark
        this.radius = 18;

        // The core data vessel
        this.coreData = {
            id: this.id,
            position: { x: x, y: 0, z: y }, // We map z to y for 2D representation
            rotation: { y: 0 },
            name: `Wanderer ${id}`
        };

        // Imbue with autonomous life
        this.soul = new NPCWanderSoul(this.coreData);
    }

    /**
     * @method update
     * @description Triggers the NPC's internal schedule and movement algorithms.
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        // We pass a generic engine time (e.g. 12 noon) to drive their schedule.
        this.soul.update(deltaTime, 12); 
    }

    /**
     * @method getManifest
     * @description Prepares the physical coordinates for the Renderer.
     */
    getManifest() {
        return {
            x: this.coreData.position.x,
            y: this.coreData.position.z, // Mapping Z back to Y for 2D screen
            radius: this.radius,
            color: this.color,
            name: this.coreData.name,
            thought: this.soul.thoughtBubble // Show what they are thinking!
        };
    }
}
