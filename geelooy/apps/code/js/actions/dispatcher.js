
// B"H
/**
 * @file dispatcher.js
 * @brief The bridge between UI signals and modular implementations.
 */

import { ActionRegistry } from './registry.js';
import { ActionExecutor } from './executor.js';

export const ActionDispatcher = {
    /**
     * B"H - Dispatches the command to the appropriate modular vessel.
     * @param {string} actionId 
     * @param {Object} context 
     */
    async dispatch(actionId, context) {
        if (!actionId) return null;

        const action = ActionRegistry.resolve(actionId);

        if (action) {
            console.log(`B\"H - Dispatcher: Manifesting deed [${actionId}]`);
            return await ActionExecutor.execute(action, context);
        }

        return null;
    }
};
