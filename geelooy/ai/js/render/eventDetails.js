//B"H
import { escapeHtml } from "./escapeHtml.js";
import { eventSearchKey } from "./eventSummaries.js";
import { eventKind, eventTitle } from "./runtime/eventLabels.js";
import { toolHeadline } from "./event-ui/toolHeadline.js";
import { renderThoughtEnvelope } from "./event-ui/thoughtEnvelopeCard.js";
import { storeEventPayload } from "./runtime/eventPayloadVault.js";

export function renderEventDetails(events = [], { maxPerGroup = 200, nested = false } = {}) {
  return dedupeEvents(events).slice(-maxPerGroup).map(event => renderEventCard(event, nested)).join("");
}

function renderEventCard(event, nested = false) {
  if (!nested && event?.raw?.groupedThoughtEnvelope) return renderThoughtEnvelope(event);
  const kind = eventKind(event);
  const title = eventTitle(event);
  const key = storeEventPayload(event);
  return `<details class="transport-details event-kind-${escapeHtml(kind)}" data-persist-key="${escapeHtml(eventSearchKey(event))}" data-event-payload-key="${escapeHtml(key)}">
    <summary><span class="event-title-wrap">${eventHeader(event, title)}</span><span class="event-panel-actions"><button type="button" data-panel-action="minimize" title="Minimize">−</button><button type="button" data-panel-action="maximize" title="Maximize">□</button><button type="button" data-panel-action="fullscreen" title="Fullscreen">⛶</button></span></summary>
  </details>`;
}

function eventHeader(event, fallback) {
  const kind = eventKind(event);
  if (kind === "awtsmoos_tool" || kind === "agent_tool" || kind === "tool_result") return toolHeader(event);
  return `<b>${escapeHtml(fallback)}</b>`;
}

function toolHeader(event = {}) {
  const info = toolHeadline(event);
  const meta = info.meta ? `<span class="event-tool-meta">${escapeHtml(info.meta)}</span>` : "";
  return `<b>${escapeHtml(info.action)}</b><span class="event-tool-target">${escapeHtml(info.target)}</span><span class="event-talked-to">talked to ${escapeHtml(info.host)}</span>${meta}`;
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
