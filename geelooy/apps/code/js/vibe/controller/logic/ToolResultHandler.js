
// B"H
/**
 * @file ToolResultHandler.js
 * @brief Processes the outcomes of autonomous tool calls.
 */

import { ToolExecutor } from '../../agent/ToolExecutor.js';

export const ToolResultHandler = {
    async handle(finalToolCalls, tab, controller) {
        if (!finalToolCalls || finalToolCalls.length === 0) return false;
        
        console.log(`[ToolResultHandler] B"H - Intercepted ${finalToolCalls.length} tool calls. Executing locally...`);
        
        let triggersLoop = false;
        const isAutoMode = tab.vibeSession.viewState?.autoMode !== false;

        for (const toolCall of finalToolCalls) {
            let toolResult = "";
            let argsObj = {};
            
            toolCall.progressMessage = "Initiating ritual...";
            if (controller && controller.refreshView) controller.refreshView(tab);

            const onProgress = (msg) => {
                toolCall.progressMessage = msg;
                if (controller && controller.refreshView) controller.refreshView(tab);
            };
            
            try {
                argsObj = JSON.parse(toolCall.function.arguments);
                const rawResult = await ToolExecutor.execute(toolCall.function.name, argsObj, tab, onProgress);
                // B"H - ABSOLUTE STRINGIFICATION SHIELD: Prevents [object Object] bleeding into history
                toolResult = (typeof rawResult === 'object' && rawResult !== null) ? JSON.stringify(rawResult, null, 2) : String(rawResult);
            } catch (e) {
                toolResult = `[B"H JSON Parse Error in Tool Arguments]: ${e.message}`;
            }
            
            toolCall.progressMessage = null; 

            // Append the stringified tool result back into history
            tab.vibeSession.history.push({
                role: 'tool',
                name: toolCall.function.name,
                tool_call_id: toolCall.id,
                content: toolResult
            });

            if (isAutoMode) {
                triggersLoop = true;
            } else {
                if (['continue_autonomous_loop', 'engrave_vessel', 'run_ui_test', 'purge_vessel', 'shift_consciousness', 'consult_oracle'].includes(toolCall.function.name)) {
                    triggersLoop = true;
                }
            }
        }
        
        return triggersLoop;
    }
};
