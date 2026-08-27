// B"H
/**
 * @file transcript.js
 * @brief Tiny transcript keeper for the sidebar AI Chat.
 *
 * Chapter 1: Sparks become memory. The Awtsmoos lets each utterance descend
 * into a clean array, not a tangled textarea, so rendering and sending remain
 * separate vessels with separate crowns.
 */

const linesBySession = new Map();

/**
 * B"H. Resolves a stable chat key from the Vibe tab.
 * @param {object} tab Active Vibe tab.
 * @returns {string} Stable memory key.
 */
export function sessionKey(tab) {
    return tab?.vibeSession?.id || tab?.item?.path || 'global-vibe-ai-chat';
}

/**
 * B"H. Adds one role line to memory.
 * @param {object} tab Active Vibe tab.
 * @param {string} role Message role.
 * @param {string} text Message text.
 * @returns {Array<object>} Updated transcript.
 */
export function pushLine(tab, role, text) {
    const key = sessionKey(tab);
    const next = [...(linesBySession.get(key) || []), { role, text, at: Date.now() }].slice(-40);
    linesBySession.set(key, next);
    return next;
}

/**
 * B"H. Clears memory for the active tab.
 * @param {object} tab Active Vibe tab.
 * @returns {void}
 */
export function clearLines(tab) {
    linesBySession.set(sessionKey(tab), []);
}

/**
 * B"H. Converts memory to model messages.
 * @param {object} tab Active Vibe tab.
 * @param {string} prompt Latest user prompt.
 * @param {string} systemPrompt System instruction.
 * @returns {Array<object>} Provider-ready messages.
 */
export function modelMessages(tab, prompt, systemPrompt) {
    const previous = (linesBySession.get(sessionKey(tab)) || []).slice(-12);
    return [
        { role: 'system', content: systemPrompt },
        ...previous.map(line => ({ role: line.role, content: line.text })),
        { role: 'user', content: prompt }
    ];
}

/**
 * B"H. Paints the transcript into plain text output.
 * @param {HTMLElement} output Output node.
 * @param {object} tab Active Vibe tab.
 * @param {string} streaming Optional streaming text.
 * @returns {void}
 */
export function paintTranscript(output, tab, streaming = '') {
    const lines = linesBySession.get(sessionKey(tab)) || [];
    const base = lines.map(line => `${line.role.toUpperCase()}: ${line.text}`).join('\n\n');
    output.textContent = [base, streaming].filter(Boolean).join('\n\n');
    output.scrollTop = output.scrollHeight;
}
