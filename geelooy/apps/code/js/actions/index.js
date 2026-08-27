
// B"H
/**
 * @file index.js (actions)
 * @brief The gateway through which all system actions flow.
 */

import { ActionDispatcher } from './dispatcher.js';

/**
 * B"H - The Actions namespace.
 * Used by the Command Palette, Context Menus, and Main Actions.
 */
export const Actions = {
    /**
     * B"H - The primary handler for turning IDs into reality.
     * @param {string} id - The Action ID.
     * @param {Object} context - Data for the action.
     */
    handle: async (id, context) => {
        return await ActionDispatcher.dispatch(id, context);
    }
};
