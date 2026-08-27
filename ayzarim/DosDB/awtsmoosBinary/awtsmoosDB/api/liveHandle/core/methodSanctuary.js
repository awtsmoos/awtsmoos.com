
// B"H
/**
 * @file api/liveHandle/core/methodSanctuary.js
 * @description
 * Chapter 32: The Temple of Methods.
 * 
 * Here reside the methods that govern all Handles. The 'resolvePointer' ritual 
 * is the gateway through which we summon the Light of an object without 
 * manual navigation. 
 * 
 * B"H: The comparison operator '<' is revealed. Escaped syntax is abolished.
 */

const SmartPointer = require('../../../utils/smartPointer/index.js');
const HandleRegistry = require('../../../core/registry/handle.js');

module.exports = {
    /**
     * @method resolvePointer
     * @description 
     * Unveils the matter within a pointer. 
     * Uses literal JS syntax: No semicolon-escapes allowed in this world.
     */
    resolvePointer(ptrBuf, db, HandleClass) {
        // Absolute literal truth restored.
        if (!ptrBuf || ptrBuf.length < 2) return null;
        
        const decoded = SmartPointer.decode(ptrBuf);
        if (!decoded) return null;
        
        // Manifesting the Chariot
        const h = new HandleClass(db, ptrBuf, decoded.type, null);
        const internalState = HandleRegistry.getSoul(h);
        
        // Final Understanding of the Vessel
        return internalState.reader.resolveSelf();
    }
};
