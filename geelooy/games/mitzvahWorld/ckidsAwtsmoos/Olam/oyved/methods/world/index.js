
/**
 * B"H
 * @module worldMethods
 * @description
 * 🌎 CHAPTER 35: THE BRIDGE OF WORLDS 🌎
 * 
 * Fragments the massive worker world operations into concise files.
 */
import WorldHeescheel from "./WorldHeescheel.js";
import EntityUpdater from "./EntityUpdater.js";

export default function(me, OlamClass) {
    return {
        /**
         * @function heescheel
         * @description The root of the worker-side world creation. 
         */
        async heescheel(options = {}) {
            return await WorldHeescheel.execute(me, OlamClass, options);
        },

        /**
         * @function updateLiveEntity
         */
        async updateLiveEntity({ id, data }) {
            return await EntityUpdater.update(me, id, data);
        }
    };
}
