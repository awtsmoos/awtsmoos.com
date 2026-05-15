
// B"H
/**
 * @file context.js
 * @brief The Memory of the Modifier Chain.
 * 
 * THE HYMN OF THE CONTEXT:
 * Before the modifier can act, it must first understand,
 * The state of the world, held in the Creator's hand.
 * This vessel of context, a map pure and deep,
 * Holds the variables of creation, the secrets to keep.
 */

export class ModifierContext {
    constructor(objectData) {
        // Holds user-defined variables like { "mySelection": [faceIndices] }
        this.variables = new Map();
        
        // Holds system-level data extracted during processing
        this.exports = {
            ...(objectData.exportedPoints || {})
        };
        
        // A reference to the object being modified, for context.
        this.objectData = objectData;
    }

    /**
     * @brief Stores a variable in the sacred ledger.
     */
    set(name, value) {
        this.variables.set(name, value);
    }

    /**
     * @brief Retrieves a variable, with an optional silent mode to prevent warnings.
     * @param {string} name - The key to look for.
     * @param {boolean} [silent=false] - If true, do not warn if the key is missing.
     * @returns {any|null} The value or null if void.
     */
    get(name, silent = false) {
        if (this.variables.has(name)) {
            return this.variables.get(name);
        }
        
        // B"H - If not found, check the exported points
        if (this.exports[name]) {
            return this.exports[name];
        }

        if (!silent) {
            console.warn(`B"H - ModifierContext: Variable '${name}' not found in the vessel of memory.`);
        }
        return null;
    }

    /**
     * @brief Exports a point for external system visibility.
     */
    export(name, value) {
        this.exports[name] = value;
    }
}
