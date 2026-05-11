
// B"H
/**
 * @file ToolCallRenderer.js
 * @brief THE SCULPTOR OF THE PHYSICAL DEEDS (Delegator).
 * 
 * CHAPTER LII: THE DELEGATED TASK
 * The Renderer had grown too vast. It now delegates the formatting of the Markdown 
 * and the updating of the DOM cards to its specialized brethren.
 */

import { ActionVesselBuilder } from './components/ActionVesselBuilder.js';
import { ToolResultFormatter } from './tools/ToolResultFormatter.js';
import { ToolCardUpdater } from './tools/ToolCardUpdater.js';

export const ToolCallRenderer = {
    render(layer, toolCalls, sessionHistory) {
        if (!toolCalls || toolCalls.length === 0) {
            layer.innerHTML = '';
            layer.style.display = 'none';
            return;
        }

        layer.style.display = 'flex';
        layer.style.flexDirection = 'column';

        for (let i = 0; i < toolCalls.length; i++) {
            const tc = toolCalls[i];
            if (!tc.id && !tc.isPseudo) continue;
            
            const cardId = 'tool-card-' + (tc.id || 'pseudo-' + i);
            let card = layer.querySelector('#' + cardId);
            
            const resultMsg = sessionHistory.find(m => m.role === 'tool' && m.tool_call_id === tc.id);
            const isFinished = !!resultMsg;

            const funcName = tc.function.name;
            let displayLabel = 'Invoking: ' + funcName + '()';
            
            try {
                const args = typeof tc.function.arguments === 'string' ? JSON.parse(tc.function.arguments) : tc.function.arguments;
                const path = args.path || args.directory_path || args.html_entry_path || args.target_url || args.query;
                if (path) displayLabel = funcName + ': ' + path;
            } catch(e) {}

            let displayContent;

            if (isFinished) {
                displayContent = ToolResultFormatter.format(String(resultMsg.content));
            } else if (tc.progressMessage) {
                displayContent = tc.progressMessage;
            } else {
                let argsStr = tc.function?.arguments || "";
                displayContent = ToolResultFormatter.formatStreamArgs(argsStr, funcName);
            }

            if (!card) {
                card = ActionVesselBuilder.build(displayLabel, displayContent, !isFinished);
                card.id = cardId;
                layer.appendChild(card);
            } else {
                ToolCardUpdater.update(card, displayLabel, displayContent, isFinished);
            }
        }
    }
};
