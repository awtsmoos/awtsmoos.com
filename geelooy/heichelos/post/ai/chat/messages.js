// B"H
/** @module AiChatMessages */
import { markdownToHtml } from "/heichelos/post/parsing.js";

/**
 * Appends one chat bubble to the conversation stream.
 * @param {string} role user or ai/model role.
 * @param {string} text Message text.
 * @param {HTMLElement} container Messages container.
 * @param {boolean} isLoading Whether to include typing indicator.
 * @returns {HTMLElement} Message element.
 */
export function appendMessage(role, text, container, isLoading = false) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `ai-message ${role}`;

    const icon = document.createElement("div");
    icon.className = "ai-msg-icon";
    icon.innerHTML = role === "user" ? "👤" : "✨";

    const bubble = document.createElement("div");
    bubble.className = "ai-msg-bubble";
    const content = document.createElement("div");
    content.className = "content";
    content.innerHTML = role === "user" ? text.replace(/\n/g, "<br>") : markdownToHtml(text);
    bubble.appendChild(content);

    if (isLoading) {
        const indicator = document.createElement("div");
        indicator.className = "typing-indicator";
        indicator.innerHTML = "<span></span><span></span><span></span>";
        bubble.appendChild(indicator);
    }

    msgDiv.append(icon, bubble);
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
    return msgDiv;
}
