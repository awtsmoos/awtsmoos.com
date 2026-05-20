// B"H
/**
 * @module AiChatState
 * @description
 * The Awtsmoos lets the chat breathe through one tiny mutable vessel instead
 * of scattering global variables across the rendering chamber.
 */

export const aiChatState = {
    history: [],
    activeCommentId: null,
    chatTitle: "Chat with Awtsmoos AI",
    currentTab: null
};

/**
 * Loads an existing conversation into the shared chat state.
 * @param {Array<object>} conversation Conversation turns.
 * @param {string|null} commentId Saved comment id.
 * @param {string} title Chat title.
 * @returns {void}
 */
export function loadStateConversation(conversation, commentId, title) {
    aiChatState.history = conversation || [];
    aiChatState.activeCommentId = commentId;
    aiChatState.chatTitle = title || "Chat with Awtsmoos AI";
}

/** @param {HTMLElement} tab Active tab element. */
export function setCurrentTab(tab) {
    aiChatState.currentTab = tab;
}

/** @param {string|null} id Saved comment id. */
export function setActiveCommentId(id) {
    aiChatState.activeCommentId = id;
}
