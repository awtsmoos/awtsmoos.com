
// B"H
/**
 * @file MessageLayerOrchestrator.js
 * @brief Manages the layers of an AI message bubble.
 */

import { ThoughtRenderer } from './ThoughtRenderer.js';
import { ToolCallRenderer } from './ToolCallRenderer.js';
import { TextRenderer } from './TextRenderer.js';
import { LoadingVessel } from './components/LoadingVessel.js';

export const MessageLayerOrchestrator = {
    updateModelMessage(node, msg, fullHistory) {
        const loadingLayer = node.querySelector('.vibe-system-loading-layer');
        const thoughtLayer = node.querySelector('.vibe-thought-layer');
        const toolLayer = node.querySelector('.vibe-tool-layer');
        const textLayer = node.querySelector('.vibe-text-layer');

        if (msg.isConnecting) {
            loadingLayer.style.display = 'block';
            loadingLayer.innerHTML = '';
            loadingLayer.appendChild(LoadingVessel.build(msg.statusText));
            
            thoughtLayer.style.display = 'none';
            toolLayer.style.display = 'none';
            textLayer.style.display = 'none';
            
            node.style.padding = '12px 16px';
            node.style.border = '1px solid var(--color-border-accent)';
            node.style.background = 'rgba(0,0,0,0.2)';
            node.style.display = 'flex';
            return;
        } else {
            loadingLayer.style.display = 'none';
            loadingLayer.innerHTML = ''; 
        }

        const raw = msg.content || "";
        let reasoningAccumulator = "";
        let speechAccumulator = "";
        
        let currentPos = 0;
        let isStreamingUnclosedThought = false;

        while (currentPos < raw.length) {
            const startIdx = raw.indexOf("<think>", currentPos);
            
            if (startIdx === -1) {
                speechAccumulator = speechAccumulator + raw.substring(currentPos);
                break;
            }
            
            speechAccumulator = speechAccumulator + raw.substring(currentPos, startIdx);
            
            const endIdx = raw.indexOf("</think>", startIdx);
            
            if (endIdx === -1) {
                reasoningAccumulator = reasoningAccumulator + raw.substring(startIdx + 7) + "\n\n";
                isStreamingUnclosedThought = true;
                break;
            } else {
                reasoningAccumulator = reasoningAccumulator + raw.substring(startIdx + 7, endIdx).trim() + "\n\n";
                currentPos = endIdx + 8; 
            }
        }

        const finalSpeech = speechAccumulator.trim();
        const finalReasoning = reasoningAccumulator.trim();
        const hasTools = msg.tool_calls && msg.tool_calls.length > 0;

        ThoughtRenderer.render(thoughtLayer, finalReasoning, msg.isStreaming && isStreamingUnclosedThought);
        ToolCallRenderer.render(toolLayer, msg.tool_calls || [], fullHistory);
        TextRenderer.render(textLayer, finalSpeech);

        if (finalSpeech === "" && finalReasoning === "" && !hasTools) {
            node.style.display = 'none';
            node.style.margin = '0';
            node.style.padding = '0';
            node.style.border = 'none';
        } else {
            node.style.display = 'flex';
            
            if (finalSpeech === "" && finalReasoning === "" && hasTools) {
                node.style.padding = '0';
                node.style.border = 'none';
                node.style.background = 'transparent';
                node.style.marginBottom = '5px';
            } else {
                node.style.padding = '12px 16px';
                node.style.border = '1px solid var(--color-border-accent)';
                node.style.background = 'rgba(0,0,0,0.2)';
                node.style.marginBottom = '10px';
            }
        }
    }
};
