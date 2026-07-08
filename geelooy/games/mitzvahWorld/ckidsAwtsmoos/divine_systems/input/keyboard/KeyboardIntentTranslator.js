
// B"H
import KeyBindingsManifest from "./KeyBindingsManifest.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * @class KeyboardIntentTranslator
 * @description
 * 🔄 THE TRANSLATOR OF BABEL 🔄
 * 
 * Converts raw string keys into canonical engine actions using the manifest.
 */
export default class KeyboardIntentTranslator {
    constructor(stateMaster) {
        this.state = stateMaster;
        this.manifest = KeyBindingsManifest.getBindings();
    }

    /**
     * @method getActiveIntents
     * @description Yields a pure object representing all active translated intentions.
     * @returns {Object}
     */
    getActiveIntents() {
        const intents = {};
        for (const[key, action] of Object.entries(this.manifest)) {
            if (this.state.isPressed(key)) {
                intents[action] = true;
            }
        }
        return intents;
    }
}
