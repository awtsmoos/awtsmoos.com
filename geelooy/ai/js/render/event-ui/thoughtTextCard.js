//B"H
import { escapeHtml } from "../escapeHtml.js";
import { renderMarkdown } from "../markdown.js";

/**
 * Chapter 24: The Thought Became a Small Spoken Chamber.
 *
 * Text thoughts are not tool panels. They are the assistant's inner prose:
 * separate, ordered, readable, and still nested inside the outer Thoughts
 * vessel like Codex-style reasoning beads on one string.
 *
 * @param {object} event Normalized thinking event.
 * @returns {string} Safe HTML for one thought-text message.
 */
export function renderThoughtTextCard(event = {}) {
  const text = String(event.text || "").trim();
  if (!text) return "";
  return `<article class="thought-text-card" data-persist-key="thought-text-${escapeHtml(event.raw?.id || event.label || text.slice(0, 24))}">
    <div class="thought-text-title">Text thought</div>
    <div class="thought-text-body">${renderMarkdown(text)}</div>
  </article>`;
}
