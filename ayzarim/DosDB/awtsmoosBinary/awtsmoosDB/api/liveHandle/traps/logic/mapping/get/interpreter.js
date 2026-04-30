
// B"H
/**
 * @file interpreter.js
 * @description
 * Chapter 2: The Translation of Light (Meturgeman).
 * The infinite intent of the Awtsmoos must be translated into finite actions.
 * This class interprets the raw Data Map (Sefiros) and prepares the 'Action'
 * for the Dispatcher. It acts as the bridge between the hidden thought and
 * the revealed speech.
 */

/**
 * @class GetMappingDataInterpreter
 * @classdesc
 * Interprets the dictionary of logic. It ensures that every request is 
 * met with a prepared class capable of performing the Divine Will.
 */
class GetMappingDataInterpreter {
    /**
     * @constructor
     * @param {Object} dataMap - The dictionary of properties to Action classes.
     */
    constructor(dataMap) {
        this.dataMap = dataMap;
        this._cache = new Map();
    }

    /**
     * @method hasEmanation
     * @description Checks if a property is written in the Book of Mapping.
     * @param {string|symbol} property - The key to check.
     * @returns {boolean}
     */
    hasEmanation(property) {
        return Object.prototype.hasOwnProperty.call(this.dataMap, property);
    }

    /**
     * @method getAction
     * @description
     * Retrieves or instantiates the Action class associated with the property.
     * We cache the instance so the soul does not have to be recreated 
     * every micro-second unnecessarily, mirroring the stability of the Heavens.
     * @param {string|symbol} property - The key to retrieve.
     * @returns {Object} An object with an .execute method.
     */
    getAction(property) {
        if (this._cache.has(property)) return this._cache.get(property);
        
        const ActionClass = this.dataMap[property];
        const instance = new ActionClass();
        this._cache.set(property, instance);
        return instance;
    }
}

module.exports = { GetMappingDataInterpreter };
