// B"H
/**
 * @file streamer.js
 * @brief The provider stream bridge for sidebar AI Chat.
 *
 * Chapter 1: The Awtsmoos draws a river through the provider gateway. This file
 * receives the river, names its currents, and returns one complete answer after
 * every spark has crossed the boundary.
 */

import { VibeAPI } from '../../../api/client.js';
import { ModelManager } from '../../../model-manager.js';
import { ToolSchemas } from '../../../agent/schemas/index.js';

/**
 * B"H. Checks whether the selected model has a usable key.
 * @param {string} modelId Selected model id.
 * @returns {string} API key.
 */
export function keyForModel(modelId) {
    return ModelManager.getKeyForModel(modelId) || ModelManager.getActiveKey() || '';
}

/**
 * B"H. Streams one chat request and resolves the final text.
 * @param {object} options Stream options.
 * @param {Array<object>} options.messages Provider messages.
 * @param {string} options.modelId Selected model id.
 * @param {Function} options.onStatus Status callback.
 * @param {Function} options.onDraft Draft callback.
 * @returns {Promise<string>} Final answer.
 */
export async function streamAiChat({ messages, modelId, onStatus, onDraft }) {
    const apiKey = keyForModel(modelId);
    if (!apiKey) throw new Error('No API key is bound for ' + modelId + '.');

    let text = '';
    let reasoning = '';
    let completed = '';

    await VibeAPI.streamChat(
        messages,
        apiKey,
        modelId,
        ToolSchemas,
        () => onStatus?.('Stream opened.'),
        chunk => {
            text += chunk || '';
            onDraft?.(formatDraft(text, reasoning));
        },
        thought => {
            reasoning += thought || '';
            onDraft?.(formatDraft(text, reasoning));
        },
        tools => onStatus?.(`${tools?.length || 0} tool call(s) requested.`),
        (finalText, finalReasoning, finalTools) => {
            completed = finalText || text;
            reasoning = finalReasoning || reasoning;
            if (finalTools?.length) onStatus?.('Tool calls: ' + finalTools.map(t => t.function?.name || 'tool').join(', '));
        },
        error => { throw error; }
    );

    return formatDraft(completed || text, reasoning);
}

function formatDraft(text, reasoning) {
    const parts = [text || ''];
    if (reasoning) parts.push('[reasoning]\n' + reasoning.slice(-800));
    return parts.filter(Boolean).join('\n\n');
}
