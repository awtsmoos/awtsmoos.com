
// B"H
/**
 * @file LogicGateway.js
 * @brief The gateway to AI iteration.
 */

import { IterationRunner } from './logic/IterationRunner.js';
import { UI } from '../../ui.js';

export const LogicController = {
    /**
     * B"H - Dispatches a request to the Iteration Engine.
     */
    async runIteration(tab, controller, promptOverride = null) {
        console.log('%cB"H [LogicGateway] Will received. Descending into Iteration Engine.', "color: #00f6ff;");
        
        try {
            return await IterationRunner.run(tab, controller, promptOverride);
        } catch (err) {
            console.error('[LogicGateway] B"H - Iteration Runner crashed: ', err);
            UI.showToast('Dimensional Shift failed: ' + err.message, 'error');
            
            if (tab.vibeSession) {
                tab.vibeSession.isProcessing = false;
                controller.refreshView(tab);
            }
        }
    }
};
