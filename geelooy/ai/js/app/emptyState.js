//B"H
/**
 * @file emptyState.js
 * @brief Converts unused chat void into a useful welcome panel.
 *
 * Chapter 16: The Awtsmoos distinguished a real message from a boot whisper.
 * Loading text and idle placeholders no longer hide the welcome nebula; only
 * actual user, assistant, or rendered conversation vessels dismiss it.
 */

const PROMPTS = Object.freeze([
  "Explain this project structure",
  "Help me debug the current file",
  "Summarize the active code",
  "Plan the next refactor"
]);

const NON_MESSAGE_CLASSES = Object.freeze([
  "ai-empty-state",
  "render-loading",
  "mobile-suggestion-rail",
  "automation-countdown"
]);

/** B"H. Mounts and observes the chat empty state. */
export function mountEmptyState() {
  const chat = document.getElementById("chat-box");
  if (!chat) return;
  ensureCard(chat);
  new MutationObserver(() => syncCard(chat)).observe(chat, { childList: true, subtree: false, characterData: false });
  syncCard(chat);
}

function ensureCard(chat) {
  if (chat.querySelector(".ai-empty-state")) return;
  const card = document.createElement("section");
  card.className = "ai-empty-state";
  card.innerHTML = `<div class="ai-empty-orb">✺</div>
    <h1>Awtsmoos AI</h1>
    <p>Ask about code, files, bugs, tunnel state, or the next move. The empty chamber is now a launchpad.</p>
    <div class="ai-empty-prompts">${PROMPTS.map(prompt => `<button type="button">${escapeHtml(prompt)}</button>`).join("")}</div>`;
  card.addEventListener("click", event => {
    const button = event.target?.closest?.("button");
    const input = document.getElementById("message-input");
    if (!button || !input) return;
    input.value = button.textContent || "";
    input.focus();
  });
  chat.prepend(card);
}

function syncCard(chat) {
  const card = chat.querySelector(".ai-empty-state");
  if (!card) return;
  card.hidden = [...chat.children].some(child => isRealMessage(child));
}

function isRealMessage(child) {
  if (!child || child.hidden) return false;
  if (NON_MESSAGE_CLASSES.some(name => child.classList?.contains(name))) return false;
  if (child.matches?.(".message,.bubble,.user-message,.assistant-message,[data-message-id]")) return Boolean(child.textContent.trim());
  return false;
}

function escapeHtml(text) {
  return String(text || "").replace(/[&<>"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[char]));
}
