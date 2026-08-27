// B"H
/**
 * @file markup.js
 * @brief Pure markup for native Code Chat.
 */

export function renderCodeChatHtml(scope) {
  return `<div class="code-chat-shell">
    <header class="code-chat-header">
      <strong>${scope.label}</strong>
      <span>Native chat · separate from Vibe Code</span>
    </header>
    <textarea id="code-chat-log" class="code-chat-log" rows="16" readonly aria-label="Code Chat conversation"></textarea>
    <textarea id="code-chat-input" class="code-chat-input" rows="4" aria-label="Code Chat message">Help me understand and improve this scope.</textarea>
    <div class="code-chat-actions">
      <button class="primary-btn" id="code-chat-send">Send</button>
      <button class="secondary-btn" id="code-chat-global">Open global chat</button>
      <button class="secondary-btn" id="code-chat-file">Open file chat</button>
      <button class="secondary-btn" id="code-chat-clear">Clear this chat</button>
    </div>
  </div>`;
}
