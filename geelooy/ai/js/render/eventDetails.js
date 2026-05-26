//B"H
import { escapeHtml } from "./escapeHtml.js";
import { eventSearchKey } from "./eventSummaries.js";
import { eventKind, eventTitle } from "./runtime/eventLabels.js";
import { toolHeadline } from "./event-ui/toolHeadline.js";
import { renderThoughtEnvelope } from "./event-ui/thoughtEnvelopeCard.js";
import { renderThoughtTextCard } from "./event-ui/thoughtTextCard.js";
import { storeEventPayload } from "./runtime/eventPayloadVault.js";

export function renderEventDetails(events = [], { maxPerGroup = 200, nested = false, stableKeyPrefix = "" } = {}) {
  return dedupeEvents(events).slice(-maxPerGroup).map((event, index) => renderEventCard(event, { nested, stableKeyPrefix, index })).join("");
}

function renderEventCard(event, { nested = false, stableKeyPrefix = "", index = 0 } = {}) {
  if (!nested && event?.raw?.groupedThoughtEnvelope) return renderThoughtEnvelope(event);
  if ((nested || event?.raw?.standaloneThoughtText) && event?.kind === "thinking" && event.text) return renderThoughtTextCard(event);
  const kind = eventKind(event);
  const title = eventTitle(event);
  const key = storeEventPayload(event, stableKeyPrefix ? { stableKey: stablePayloadKey(stableKeyPrefix, event, index) } : {});
  return `<details class="transport-details event-kind-${escapeHtml(kind)}" data-persist-key="${escapeHtml(eventSearchKey(event))}" data-event-payload-key="${escapeHtml(key)}">
    <summary><span class="event-title-wrap">${eventHeader(event, title)}</span></summary>
    ${panelActions()}
  </details>`;
}

function panelActions() {
  return `<span class="event-panel-actions"><button type="button" data-panel-action="minimize" title="Minimize">−</button><button type="button" data-panel-action="maximize" title="Maximize">□</button><button type="button" data-panel-action="fullscreen" title="Fullscreen">⛶</button></span>`;
}

function eventHeader(event, fallback) {
  const kind = eventKind(event);
  if (kind === "awtsmoos_tool" || kind === "awtsmoos_tool_result" || kind === "agent_tool" || kind === "tool_result") return toolHeader(event);
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

function stablePayloadKey(prefix, event, index) {
  const rawKey = `${prefix}::${eventSearchKey(event) || index}`;
  return rawKey.replace(/\s+/g, " ").slice(0, 700);
}
