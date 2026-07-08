
// B"H
import EntityIdGenerator from "./EntityIdGenerator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * @class EntityStateData
 * @description
 * 🧬 THE DNA OF EXISTENCE 🧬
 * 
 * A pure JSON representation of a living or inanimate object in the world.
 */
export default class EntityStateData {
    static create(type, name) {
        return {
            id: EntityIdGenerator.generate(type),
            type: type,
            name: name || "Anonymous Spark",
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            isActive: true,
            isSolid: false,
            attributes: {}
        };
    }
}
