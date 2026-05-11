
// B"H
/**
 * @file IterationFinalizer.js
 * @brief Harmonizing the aftermath of a manifestation and orchestrating serial cycles.
 */

import { VibeDB } from '../../db.js';
import { ToolResultHandler } from './ToolResultHandler.js';
import { RecursiveHarvester } from './RecursiveHarvester.js';

export const IterationFinalizer = {
    /**
     * @async
     * @function complete
     * @description Solemnly conclude a single cycle and check for the need for expansion.
     */
    async complete(tab, controller, lastMsg, finalText, finalReasoning, finalTools, signature) {
        lastMsg.isStreaming = false;
        lastMsg.isConnecting = false; 
        lastMsg.content = (finalReasoning ? '<think>\n' + finalReasoning + '\n</think>\n' : '') + finalText;
        
        if (finalTools && finalTools.length > 0) {
            if (signature) finalTools.forEach(tc => { tc.thought_signature = signature; });
            lastMsg.tool_calls = finalTools;
        }

        await VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession);
        controller.refreshView(tab);

        // B"H - THE CORE SERIALIZATION FIX:
        // We await ALL local tool results (including disk writes) before checking the harvester.
        let localToolResultDeterminedCycleNeeded = false;
        if (finalTools && finalTools.length > 0) {
            localToolResultDeterminedCycleNeeded = await ToolResultHandler.handle(finalTools, tab, controller);
        }

        // Only after all actions are finished do we consult the Harvest for automated continuation.
        let triggersRefinement = false;
        if (!localToolResultDeterminedCycleNeeded) {
            triggersRefinement = RecursiveHarvester.checkAndTrigger(tab, controller);
        }

        const totalCyclicalTrigger = localToolResultDeterminedCycleNeeded || triggersRefinement;

        if (totalCyclicalTrigger) {
            const { IterationRunner } = await import('./IterationRunner.js');
            return IterationRunner.run(tab, controller, null, true);
        }

        // Rest. All physical manifestations confirmed.
        tab.vibeSession.isProcessing = false;
        controller.refreshView(tab);
        await controller.refreshTree(tab);
    }
};
