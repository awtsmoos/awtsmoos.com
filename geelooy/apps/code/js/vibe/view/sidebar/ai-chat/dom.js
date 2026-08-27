// B"H
/**
 * @file dom.js
 * @brief JSON-to-DOM blueprints for the sidebar AI Chat.
 *
 * Chapter 1 continues: the Awtsmoos lowers light into borders, buttons, and
 * scroll chambers. Every node is a named vessel, so CSS can breathe instead of
 * fighting cramped inline fragments.
 */

import { HTML } from '../../../../html-generator.js';
import { AI_CHAT_COPY, AI_CHAT_IDS } from './config.js';

/**
 * B"H. Renders the empty-key gate.
 * @returns {HTMLElement} The key warning vessel.
 */
export function noKeyView() {
    return HTML({
        className: 'vibe-ai-chat-empty',
        children: [
            { className: 'vibe-ai-chat-empty-icon', text: '🔑' },
            { tag: 'h3', text: AI_CHAT_COPY.noKeyTitle },
            { tag: 'p', text: AI_CHAT_COPY.noKeyBody }
        ]
    });
}

/**
 * B"H. Renders the full AI chat chamber.
 * @param {Array<object>} models Available model records.
 * @param {string} currentModel Current model id.
 * @returns {HTMLElement} The chat root.
 */
export function chatView(models, currentModel) {
    return HTML({
        id: AI_CHAT_IDS.root,
        className: 'vibe-ai-chat-root',
        children: [headerView(models, currentModel), outputView(), inputView()]
    });
}

function headerView(models, currentModel) {
    return {
        className: 'vibe-ai-chat-header',
        children: [
            { className: 'vibe-ai-chat-title', text: '⚡ ' + AI_CHAT_COPY.title },
            {
                tag: 'select',
                id: AI_CHAT_IDS.model,
                className: 'vibe-ai-chat-model',
                children: models.map(model => ({
                    tag: 'option',
                    value: model.id,
                    text: model.displayName || model.id,
                    attributes: model.id === currentModel ? { selected: 'selected' } : {}
                }))
            }
        ]
    };
}

function outputView() {
    return {
        className: 'vibe-ai-chat-scroll',
        children: [
            { id: AI_CHAT_IDS.status, className: 'vibe-ai-chat-status', text: AI_CHAT_COPY.empty },
            { id: AI_CHAT_IDS.output, className: 'vibe-ai-chat-output', text: '' }
        ]
    };
}

function inputView() {
    return {
        className: 'vibe-ai-chat-composer',
        children: [
            { tag: 'textarea', id: AI_CHAT_IDS.prompt, className: 'vibe-ai-chat-prompt', placeholder: 'Ask about the code, CSS, plan, bug, or next step…' },
            {
                className: 'vibe-ai-chat-actions',
                children: [
                    { tag: 'button', id: AI_CHAT_IDS.clear, className: 'secondary-btn vibe-ai-chat-clear', text: 'Clear' },
                    { tag: 'button', id: AI_CHAT_IDS.send, className: 'primary-btn vibe-ai-chat-send', text: 'Send ✦' }
                ]
            }
        ]
    };
}

/**
 * B"H. Finds live nodes after render.
 * @param {HTMLElement} container Render host.
 * @returns {object} Named DOM references.
 */
export function refs(container) {
    const byId = id => container.querySelector('#' + id);
    return {
        prompt: byId(AI_CHAT_IDS.prompt),
        send: byId(AI_CHAT_IDS.send),
        clear: byId(AI_CHAT_IDS.clear),
        model: byId(AI_CHAT_IDS.model),
        output: byId(AI_CHAT_IDS.output),
        status: byId(AI_CHAT_IDS.status)
    };
}
