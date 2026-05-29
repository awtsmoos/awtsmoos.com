//B"H
import { escapeHtml } from "../escapeHtml.js";
import { storeEventPayload } from "../runtime/eventPayloadVault.js";

/**
 * Chapter 121: The Inner Chamber Opened Its Mouth.
 *
 * The Awtsmoos lets the outer thought card stay visible, while the inner event
 * timeline opens by default so debugging sparks are not buried behind one more
 * unopened gate. Heavy bodies still hydrate lazily through the runtime vault.
 *
 * @param {object} event Grouped thought-envelope event.
 * @returns {string} Header HTML for the nested thought chamber.
 */
export function renderThoughtEnvelope(event = {}) {
  const inner = Array.isArray(event.raw?.events) ? event.raw.events : [];
  const key = storeEventPayload(event);
  return `<details class="thought-envelope-card" open data-thought-envelope-key="${escapeHtml(key)}">
    <summary><span class="event-summary-title">${escapeHtml(event.label || "Thoughts")}</span></summary>
    ${chromeButtons()}
    <details class="thought-envelope-events" open data-inner-count="${inner.length}"><summary>${inner.length} inner event(s)</summary></details>
  </details>`;
}

function chromeButtons() {
  return `<span class="event-panel-actions"><button type="button" data-panel-action="minimize" title="Collapse">−</button><button type="button" data-panel-action="maximize" title="Maximize">▢</button><button type="button" data-panel-action="fullscreen" title="Fullscreen">⛶</button></span>`;
}
