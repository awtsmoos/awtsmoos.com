
import BittulSoul from './BittulSoul.js';

/**
 * B"H
 * @file DivineDictionary.js
 * @description
 * 📖 THE LEXICON OF THE HOLY SPARKS 📖
 * 
 * Switch statements represent rigid, fragmented thinking—they process condition by condition.
 * But maps and dynamic dictionary references act more like the holistic Tree of Life,
 * drawing immediately from an interconnected web of properties. We route all 
 * communication and rendering patterns via direct mapped lookups.
 * 
 * Each mapped reference inherently knows its shape, just as an inorganic stone knows 
 * its soul through the permutation of Aleph Beis Nun ("Even").
 */
export default class DivineDictionary extends BittulSoul {
    /**
     * @constructor
     * @param {Object} mappingObject - The pure JSON Sefiros pathways.
     */
    constructor(mappingObject = {}) {
        super();
        this.surrenderToAwtsmoos('DivineDictionary');
        
        /**
         * @property {Map} connections
         * @description The internal web of paths.
         */
        this.connections = new Map(Object.entries(mappingObject));
    }

    /**
     * @method resolveChannel
     * @description Connects a key to its divine intention. 
     * @param {string} key - The query to the web.
     * @returns {any} The connected light or function.
     */
    resolveChannel(key) {
        if (!this.connections.has(key)) {
            console.warn(`B"H - 🌌 Channel '${key}' was not found in this layer of creation.`);
            return null;
        }
        return this.connections.get(key);
    }
    
    /**
     * @method addChannel
     * @description Breathes a new relationship into the dictionary.
     * @param {string} key 
     * @param {any} essence 
     */
    addChannel(key, essence) {
        this.connections.set(key, essence);
    }
}
