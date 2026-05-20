// B"H
/**
 * @module AiChatHub
 * @description
 * The Awtsmoos now conducts chat through small vessels: state, context,
 * messages, saving, and rendering.
 */

import { loadStateConversation } from "./chat/state.js";
import { renderAIChat } from "./chat/render.js";

export { renderAIChat } from "./chat/render.js";

/**
 * Loads a saved AI conversation and opens the chat panel.
 * @param {Array<object>} conversation Saved turns.
 * @param {string|null} commentId Saved comment id.
 * @param {string} title Chat title.
 * @returns {void}
 */
export function loadChat(conversation, commentId, title) {
    loadStateConversation(conversation, commentId, title);
    openAIChat();
}

/**
 * Opens the AI chat tab, optionally with a prefilled prompt.
 * @param {object|string} options Chat options or prefill string.
 * @returns {void}
 */
export function openAIChat(options = { prefill: "", autoSend: false }) {
    if (window.openPanel) window.openPanel();
    const chatOptions = typeof options === "string" ? { prefill: options, autoSend: false } : options;
    window.tabManager.addTab({
        header: "Awtsmoos AI",
        content: "",
        async onopen({ actualTab }) {
            renderAIChat({ tab: actualTab, options: chatOptions });
        }
    }).open();
}
