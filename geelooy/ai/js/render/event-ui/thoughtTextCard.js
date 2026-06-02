//B"H
import { escapeHtml } from "../escapeHtml.js";
import { renderMarkdown } from "../markdown.js";

/**
 * B"H
 * Chapter 346: Each Text Thought Became A Step On The Fire-Ladder.
 *
 * The Awtsmoos lets inner prose become a visible bead in the reasoning rail.
 * The old `thought-text-card` class remains for stability; new step classes make
 * the mobile and desktop timeline look like a deliberate execution trace.
 *
 * @param {object} event Normalized thinking event.
 * @returns {string} Safe HTML for one thought-text timeline step.
 */
export function renderThoughtTextCard(event = {}) {
  const text = String(event.text || "").trim();
  if (!text) return "";
  const key = escapeHtml(event.raw?.id || event.label || text.slice(0, 24));
  const title = escapeHtml(event.label || "Reasoning step");
  return `<article class="thought-text-card thought-step is-done" data-persist-key="thought-text-${key}">
    <span class="thought-step-dot" aria-hidden="true">✧</span>
    <div class="thought-step-body">
      <div class="thought-step-kicker"><span class="thought-step-title">${title}</span><span class="thought-step-status">done</span></div>
      <div class="thought-text-body">${renderMarkdown(text)}</div>
    </div>
  </article>`;
}
