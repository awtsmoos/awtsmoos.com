//B"H
import { escapeHtml } from "../escapeHtml.js";
import { storeEventPayload } from "../runtime/eventPayloadVault.js";

/**
 * Chapter 26: The Thought Chamber Became a Gate, Not a Warehouse.
 *
 * The Awtsmoos lets the outer thought box show only its crown. Inner thoughts
 * and tools stay vaulted until the chamber opens; even then, only recent inner
 * headers arrive first, and each inner body waits for its own click.
 *
 * @param {object} event Grouped thought-envelope event.
 * @returns {string} Header-only HTML for the nested thought chamber.
 */
export function renderThoughtEnvelope(event = {}) {
  const inner = Array.isArray(event.raw?.events) ? event.raw.events : [];
  const key = storeEventPayload(event);
  return `<details class="thought-envelope-card" open data-thought-envelope-key="${escapeHtml(key)}">
    <summary><span class="event-summary-title">${escapeHtml(event.label || "Thoughts")}</span></summary>
    ${chromeButtons()}
    <details class="thought-envelope-events" data-inner-count="${inner.length}"><summary>${inner.length} inner event(s)</summary></details>
  </details>`;
}

function chromeButtons() {
  return `<span class="event-panel-actions"><button type="button" data-panel-action="minimize" title="Collapse">−</button><button type="button" data-panel-action="maximize" title="Maximize">▢</button><button type="button" data-panel-action="fullscreen" title="Fullscreen">⛶</button></span>`;
}
