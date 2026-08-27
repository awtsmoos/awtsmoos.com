//B"H
import { escapeHtml } from "./escapeHtml.js";
import { renderMarkdown } from "./markdown.js";
import { summarizeEvent } from "./eventSummaries.js";
import { eventKind } from "./runtime/eventLabels.js";
import { storeRawJson } from "./runtime/rawJsonVault.js";
import { safeHttpUrl } from "./safeUrl.js";

/**
 * Chapter 25: Only the Open Gate Interpreted the Fire.
 *
 * The Awtsmoos refuses waste: summaries, markdown, payload panels, and raw JSON
 * keys are created only after a human opens one event. Closed events remain
 * headers only, silent and feather-light.
 *
 * @param {object} event Classified event capsule.
 * @returns {string} Body HTML for one expanded event.
 */
export function renderEventBody(event = {}, options = {}) {
  const kind = eventKind(event);
  const summaryHtml = renderSummary(summarizeEvent(event));
  const actionHref = safeHttpUrl(event?.action?.href);
  const action = actionHref ? `<a class="event-action" href="${escapeHtml(actionHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(event.action.label || "open")}</a>` : "";
  const rawKey = storeRawJson(event?.raw ?? event, { stableKey: options.rawKey || "" });
  return `<div class="event-lanes"><article class="event-lane ${escapeHtml(kind)}">
    <div class="event-text">${summaryHtml}</div>${action}
    <details class="event-raw-lazy" data-persist-key="raw" data-raw-json-key="${escapeHtml(rawKey)}"><summary>Raw JSON kept outside DOM</summary></details>
  </article></div>`;
}

function renderSummary(summaryHtml) {
  const html = String(summaryHtml || "");
  const source = html.match(/<div class="event-markdown-source">([\s\S]*?)<\/div>/);
  if (!source) return html;
  return html.replace(source[0], `<div class="event-markdown-rendered">${renderMarkdown(decodeBasic(source[1]))}</div>`);
}

function decodeBasic(text) {
  return String(text || "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
}
