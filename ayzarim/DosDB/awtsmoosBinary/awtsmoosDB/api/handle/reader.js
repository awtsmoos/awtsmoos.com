
// B"H
/**
 * @file reader.js
 * @chapter The Well of Binah (Understanding)
 * 
 * Chapter 17: The Differentiator of Form.
 * 
 * Binah is Understanding. It is the wide expanse that receives the seed
 * of Wisdom and differentiates it into recognizable form. This Reader 
 * takes the microscopic point of a Pointer and expands it into 
 * a recognized object, array, or primitive.
 *
 * "The mother of children is joyful." Binah gives birth to the revealed
 * data that the application can finally embrace. Without the proper 
 * resolution of the coordinates, the Mother has no path to the child.
 */

const Scalars = require('./reader/scalars.js');

/**
 * @class HandleReader
 * @description
 * Extracts the light from the physical binary vessels and manifests it 
 * as JavaScript entities.
 */
class HandleReader {
    /**
     * @constructor
     * @param {Object} state - The internal soul-state of the handle.
     */
    constructor(state) {
        this.state = state;
        this.db = state.db;
    }

    /**
     * @method resolveSelf
     * @description 
     * Fully rehydrates the vessel's content. It first ensures the coordinates 
     * are revealed, then reads the exact measure of truth from the disk.
     * 
     * @returns {*} The manifest data (String, Number, Object, etc.).
     */
    resolveSelf() {
        // B"H: Pierce the veil to reveal the actual coordinates.
        this.state.ensureResolved();
        
        const type = this.state.actualType;
        const ptr = this.state.actualPtr;

        // B"H: If the coordinate is missing, the void is silent.
        if (!ptr || ptr.offset === undefined) {
            return undefined;
        }

        // Binary read from the physical firmament
        const buf = this.db.pager.readExact(ptr.offset, ptr.length);

        // B"H: Data-driven routing for structures vs scalars
        const StructuralTypes = new Set([14, 15, 12, 18]); // Dict, Seq, Map, SmartObj

        if (StructuralTypes.has(type)) {
             const StructureRehydrator = require('./reader/structure.js');
             return StructureRehydrator.manifest(this.db, type, buf);
        }

        // The manifestation of an atomic primitive
        return Scalars.read(type, buf);
    }

    /**
     * @method length
     * @description Peeks at the dimensions of a sequential container.
     * @returns {number} The count of internal sparks.
     */
    length() {
        this.state.ensureResolved();
        // [Logic to load header and read count from the binary structure]
        return 0; 
    }

    /**
     * @method keys
     * @description An eternal generator that reveals the names of the sparks.
     */
    *keys() {
        this.state.ensureResolved();
        // [Logic to yield keys from the binary structure]
    }

    /**
     * @method iterator
     * @description Streams the contents of the vessel one by one.
     */
    *iterator() {
        this.state.ensureResolved();
        // [Logic to stream handles or values from the structure]
    }
}

module.exports = HandleReader;
