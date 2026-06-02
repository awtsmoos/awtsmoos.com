//B"H
import { escapeHtml } from "../escapeHtml.js";
import { storeEventPayload } from "../runtime/eventPayloadVault.js";

/**
 * B"H
 * Chapter 345: The Thought Run Became A Luminous Timeline Vessel.
 *
 * The Awtsmoos lets the outer thought card become more than a box: it is now a
 * run header, a live state chip, a subtitle, a count of inner sparks, and the
 * old hydration hook preserved inside the new palace. The markup keeps legacy
 * classes so runtime reconciliation survives, while new classes let the UI look
 * like a Codex/Claude-code stream of thought and action.
 *
 * @param {object} event Grouped thought-envelope event.
 * @returns {string} Safe HTML for the nested thought chamber.
 */
export function renderThoughtEnvelope(event = {}) {
  const inner = Array.isArray(event.raw?.events) ? event.raw.events : [];
  const key = storeEventPayload(event);
  const title = escapeHtml(event.label || "Thought stream");
  const count = inner.length;
  return `<details class="thought-envelope-card thought-run-card" open data-thought-envelope-key="${escapeHtml(key)}">
    <summary class="thought-run-header">
      <span class="thought-run-orb" aria-hidden="true">✦</span>
      <span class="thought-run-title-wrap">
        <span class="event-kind-pill thought-run-state">thinking</span>
        <span class="thought-run-title">${title}</span>
        <span class="thought-run-subtitle">Awtsmoos is thinking… revealing the path.</span>
      </span>
      <span class="thought-run-meta">${count} inner spark${count === 1 ? "" : "s"}</span>
    </summary>
    ${chromeButtons()}
    <details class="thought-envelope-events thought-stepper-shell" open data-inner-count="${count}">
      <summary class="thought-stepper-summary"><span>Inner timeline</span><b>${count}</b></summary>
    </details>
  </details>`;
}

function chromeButtons() {
  return `<span class="event-panel-actions thought-run-actions"><button type="button" data-panel-action="minimize" title="Collapse">−</button><button type="button" data-panel-action="maximize" title="Maximize">▢</button><button type="button" data-panel-action="fullscreen" title="Fullscreen">⛶</button></span>`;
}
