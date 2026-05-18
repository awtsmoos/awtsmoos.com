// B"H
/**
 * @file IterationFinalizer.js
 * @brief Harmonizing the aftermath of a manifestation and orchestrating serial cycles.
 */

import { VibeDB } from '../../db.js';
import { ToolResultHandler } from './ToolResultHandler.js';
import { RecursiveHarvester } from './RecursiveHarvester.js';
import { UniversalActionParser } from '../../agent/logic/UniversalActionParser.js';
import { EvaluatorGate } from './EvaluatorGate.js';
import { AutoPreviewLauncher } from './AutoPreviewLauncher.js';

export const IterationFinalizer = {
    /**
     * @async
     * @function complete
     * @description Solemnly conclude a single cycle and check for the need for expansion.
     */
    async complete(tab, controller, lastMsg, finalText, finalReasoning, finalTools, signature) {
        const pseudoToolCalls = UniversalActionParser.parse(finalText);
        const allToolCalls = (finalTools && finalTools.length > 0) ? finalTools : pseudoToolCalls;
        const visibleText = UniversalActionParser.strip(finalText);

        lastMsg.isStreaming = false;
        lastMsg.isConnecting = false; 
        lastMsg.content = (finalReasoning ? '<think>\n' + finalReasoning + '\n</think>\n' : '') + visibleText;

        if (allToolCalls && allToolCalls.length > 0) {
            if (signature) allToolCalls.forEach(tc => { tc.thought_signature = signature; });
            lastMsg.tool_calls = allToolCalls;
        }

        await VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession);
        controller.refreshView(tab);

        let localToolResultDeterminedCycleNeeded = false;
        if (allToolCalls && allToolCalls.length > 0) {
            localToolResultDeterminedCycleNeeded = await ToolResultHandler.handle(allToolCalls, tab, controller);
        }

        let triggersRefinement = false;
        if (!localToolResultDeterminedCycleNeeded) {
            triggersRefinement = RecursiveHarvester.checkAndTrigger(tab, controller);
        }

        const totalCyclicalTrigger = localToolResultDeterminedCycleNeeded || triggersRefinement;
        const evalDecision = EvaluatorGate.evaluate({
            visibleText,
            toolCalls: allToolCalls,
            tab
        });
        const gatedTrigger = totalCyclicalTrigger || evalDecision.shouldContinue;

        if (gatedTrigger) {
            const { IterationRunner } = await import('./IterationRunner.js');
            return IterationRunner.run(tab, controller, null, true);
        }

        await controller.refreshTree(tab);
        await AutoPreviewLauncher.maybeLaunch({
            tab,
            toolCalls: allToolCalls || [],
            lastMsg
        });

        tab.vibeSession.isProcessing = false;
        controller.refreshView(tab);
        await VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession);
    }
};
