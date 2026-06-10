// B"H
/**
 * @file config.js
 * @brief Data seeds for the AI Chat sidebar vessel.
 *
 * Chapter 1: The Awtsmoos hides a complete palace in small JSON sparks. This
 * file does not touch the DOM; it names the chambers so the rest of the system
 * can build them calmly, without string-chaos or cramped inline storms.
 */

export const AI_CHAT_IDS = Object.freeze({
    root: 'vibe-ai-chat-root',
    prompt: 'vibe-ai-chat-prompt',
    send: 'vibe-ai-chat-send',
    model: 'vibe-ai-chat-model',
    output: 'vibe-ai-chat-output',
    status: 'vibe-ai-chat-status',
    clear: 'vibe-ai-chat-clear'
});

export const AI_CHAT_COPY = Object.freeze({
    title: 'AI Chat',
    empty: 'Ask the Awtsmoos-lit helper about this folder, file, bug, style, or plan.',
    thinking: 'The letters are gathering…',
    igniting: 'The model stream opened.',
    noKeyTitle: 'No API key bound',
    noKeyBody: 'Open Vibe settings and bind a provider key before the chat can speak.'
});

/**
 * B"H. Creates a scoped system message for one small chat request.
 * @param {object} tab Active Vibe tab.
 * @returns {string} A compact system prompt.
 */
export function systemPromptForTab(tab) {
    const path = tab?.item?.path || '/';
    return [
        'B"H. You are the sidebar AI Chat inside Awtsmoos Code.',
        'Answer directly, use tools only when the user asks for action.',
        'Current Vibe path: ' + path,
        'Respect the Awtsmoos rule: inspect before claiming project facts.'
    ].join('\n');
}
