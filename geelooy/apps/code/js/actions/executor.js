
// B"H
/**
 * @file executor.js
 * @brief Safely executes modular action definitions.
 */

export const ActionExecutor = {
    /**
     * B"H - Invokes the 'run' method of a defined action.
     * @param {Object} definition 
     * @param {Object} context 
     */
    async execute(definition, context) {
        if (!definition || typeof definition.run !== 'function') {
            console.error("B\"H - Executor: Invalid action definition received.");
            return null;
        }

        try {
            return await definition.run(context);
        } catch (e) {
            console.error("B\"H - Executor: Tragedy during action manifestation.", e);
            throw e;
        }
    }
};
