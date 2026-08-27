
// B"H
/**
 * @file data.js
 * @description
 * Chapter 3: The Array of the Sefiros (Seder Histalshelus).
 * In this file, we define the actual logic classes. Each class is a modular
 * component of the whole, a specific 'Action' that the Awtsmoos performs 
 * when a certain property is accessed. By splitting these into a data-map,
 * we allow for infinite expansion without ever needing a 'switch' statement.
 */

/**
 * @class BaseGetAction
 * @classdesc The abstract essence of all 'Get' logic.
 */
class BaseGetAction {
    /**
     * @method execute
     * @description The core commandment. 
     * @param {Object} target 
     * @param {string} property 
     * @param {Object} receiver 
     * @param {Class} Registry - The HandleRegistry class for soul-searching.
     */
    execute(target, property, receiver, Registry) {
        throw new Error("Action must implement execute() to manifest in reality.");
    }
}

/**
 * @class MetadataAction
 * @extends BaseGetAction
 * @classdesc Reveals the internal metadata (soul-breath) of the handle.
 */
class MetadataAction extends BaseGetAction {
    execute(target, property, receiver, Registry) {
        const soul = Registry.getSoul(receiver || target);
        return soul ? soul.metadata : undefined;
    }
}

/**
 * @class InternalStateAction
 * @extends BaseGetAction
 * @classdesc Directly accesses the state object bound to the vessel.
 */
class InternalStateAction extends BaseGetAction {
    execute(target, property, receiver, Registry) {
        return Registry.getSoul(receiver || target);
    }
}

/**
 * @constant GetLogicEmanatorMap
 * @description
 * The map that connects the physical property string to the Divine Action.
 * Adding new logic is as simple as adding a key here.
 */
const GetLogicEmanatorMap = {
    '_awtsmoos_metadata': MetadataAction,
    '_awtsmoos_state': InternalStateAction
};

module.exports = { GetLogicEmanatorMap };
