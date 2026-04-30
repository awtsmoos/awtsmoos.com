
import { MenuChariot } from '../MenuChariot.js';
import { GameAwtsmoosController } from '../../core/GameAwtsmoosController.js';

/**
 * @class DivineActionMap
 * @description
 * B"H
 * The Awtsmoos desires harmony, not a chaotic 'switch' of endless cases.
 * Here, every action is a mapped key, a specific emanation.
 * When an event occurs, it matches perfectly to its destined function,
 * without evaluating a chain of 'if/else' illusions.
 * 
 * This object maps string action identifiers to actual executable functions.
 */
export class DivineActionMap {
    /**
     * The sacred mapping of intentions to actions.
     * @private
     */
    static #actions = {
        'GO_TO_LEVEL_SELECT': () => {
            MenuChariot.manifestMenu('levelSelect');
        },
        'GO_TO_MAIN_MENU': () => {
            MenuChariot.manifestMenu('main');
        },
        'LOAD_WORLD': (worldId) => {
            MenuChariot.clearAllMenues();
            GameAwtsmoosController.initiateWorld(worldId);
        },
        'FIND_ALIAS': () => {
            console.log("B\"H - Finding worlds by alias... (To be implemented by the higher spheres)");
            alert("B\"H\nConnecting to Alias network...");
        },
        'LOAD_FILE': () => {
            console.log("B\"H - Loading world from local scroll... (File system API)");
            alert("B\"H\nOpening file dialog of existence...");
        }
    };

    /**
     * @function execute
     * @description
     * B"H
     * Channels the intention into reality. Looks up the action key
     * and invokes its corresponding function with optional payloads.
     * 
     * @param {string} actionKey - The identifier of the action.
     * @param {*} [payload] - Optional data to pass to the action.
     * @returns {void}
     */
    static execute(actionKey, payload = null) {
        const action = this.#actions[actionKey];
        if (action && typeof action === 'function') {
            action(payload);
        } else {
            console.warn(`B"H - The action '${actionKey}' has no vessel in this realm.`);
        }
    }
}
