
// B"H
/**
 * @file logic.js
 * @brief Infinite Modularity Façade for Iteration Runner.
 * 
 * THE MIND DELEGATED:
 * This vessel used to hold the heavy burden of both the AI conversation
 * and the stream parsing. Now, it merely stands as a gatekeeper,
 * pointing the user's intent toward the highly specific and focused
 * IterationRunner module. 
 */

import { IterationRunner } from './logic/IterationRunner.js';

export const LogicController = {
    /**
     * B"H
     * Re-routes the logic call to the pure IterationRunner.
     */
    async runIteration(tab, controller, promptOverride = null) {
        return await IterationRunner.run(tab, controller, promptOverride);
    }
};
