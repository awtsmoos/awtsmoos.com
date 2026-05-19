//B"H
import { escapeHtml } from "./escapeHtml.js";
import { renderMarkdown } from "./markdown.js";
import { summarizeEvent, eventSearchKey } from "./eventSummaries.js";
import { eventKind, eventTitle } from "./runtime/eventLabels.js";

export function renderEventDetails(events = [], { maxPerGroup = 200 } = {}) {
  return dedupeEvents(events).slice(-maxPerGroup).map(renderEventCard).join("");
}

function renderEventCard(event) {
  const kind = eventKind(event);
  const title = eventTitle(event);
  const summaryHtml = renderSummary(summarizeEvent(event));
  const raw = escapeHtml(safeJson(event?.raw ?? event));
  const action = event?.action?.href ? `<a class="event-action" href="${escapeHtml(event.action.href)}" target="_blank" rel="noreferrer">${escapeHtml(event.action.label || "open")}</a>` : "";
  return `<details class="transport-details event-kind-${escapeHtml(kind)}" data-persist-key="${escapeHtml(eventSearchKey(event))}">
    <summary><b>${escapeHtml(title)}</b></summary>
    <div class="event-lanes">
      <article class="event-lane ${escapeHtml(kind)}">
        <div class="event-text">${summaryHtml}</div>
        ${action}
        <details class="event-raw" data-persist-key="raw"><summary>Full raw JSON</summary><pre><code>${raw}</code></pre></details>
      </article>
    </div>
  </details>`;
}

function renderSummary(summaryHtml) {
  const html = String(summaryHtml || "");
  const source = html.match(/<div class="event-markdown-source">([\s\S]*?)<\/div>/);
  if (!source) return html;
  return html.replace(source[0], `<div class="event-markdown-rendered">${renderMarkdown(decodeBasic(source[1]))}</div>`);
}

function dedupeEvents(events = []) {
  const seen = new Set();
  return events.filter(event => {
    const key = eventSearchKey(event).replace(/\s+/g, " ").slice(0, 600);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function safeJson(value) { try { return JSON.stringify(value, null, 2); } catch { return String(value || ""); } }
function decodeBasic(text) { return String(text || "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"'); }
