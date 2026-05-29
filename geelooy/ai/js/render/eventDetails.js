//B"H
import { escapeHtml } from "./escapeHtml.js";
import { eventSearchKey } from "./eventSummaries.js";
import { eventKind, eventTitle } from "./runtime/eventLabels.js";
import { toolHeadline } from "./event-ui/toolHeadline.js";
import { renderThoughtEnvelope } from "./event-ui/thoughtEnvelopeCard.js";
import { renderThoughtTextCard } from "./event-ui/thoughtTextCard.js";
import { storeEventPayload } from "./runtime/eventPayloadVault.js";

/**
 * B"H
 * Chapter 171: Every Trace Became One Readable Instrument.
 *
 * ChatGPT, MiniMax, OpenRouter, Groq, and the Awtsmoos tunnel all pass through
 * this one card shape. A user sees a clean title, a kind badge, a target, and
 * optional timing/host metadata; the raw payload waits behind the same chrome.
 */
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
    <summary>${eventHeader(event, title, kind)}${panelActions()}</summary>
  </details>`;
}

function panelActions() {
  return `<span class="event-panel-actions"><button type="button" data-panel-action="minimize" title="Collapse">−</button><button type="button" data-panel-action="maximize" title="Maximize">□</button><button type="button" data-panel-action="fullscreen" title="Fullscreen">⛶</button></span>`;
}

function eventHeader(event, fallback, kind) {
  if (isToolish(kind)) return toolHeader(event, kind);
  return `<span class="event-title-wrap"><span class="event-kind-pill">${escapeHtml(kindLabel(kind))}</span><b>${escapeHtml(fallback)}</b>${event.text ? `<span class="event-brief">${escapeHtml(short(event.text, 120))}</span>` : ""}</span>`;
}

function toolHeader(event = {}, kind = "tool") {
  const info = toolHeadline(event);
  const meta = info.meta ? `<span class="event-tool-meta">${escapeHtml(info.meta)}</span>` : "";
  const host = info.host ? `<span class="event-talked-to">${escapeHtml(info.host)}</span>` : "";
  const target = info.target && info.target !== info.action ? `<span class="event-tool-target">${escapeHtml(info.target)}</span>` : "";
  return `<span class="event-title-wrap"><span class="event-kind-pill">${escapeHtml(kindLabel(kind))}</span><b>${escapeHtml(info.action || "tool")}</b>${target}${host}${meta}</span>`;
}

function isToolish(kind = "") {
  return /tool|function|awtsmoos/i.test(kind);
}

function kindLabel(kind = "") {
  return ({ awtsmoos_tool: "tool call", awtsmoos_tool_result: "tool result", agent_tool: "tool call", tool_result: "tool result", thinking: "thought", hidden: "hidden", status: "status", oauth: "auth", raw: "event" })[kind] || kind.replace(/_/g, " ");
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

function short(value = "", max = 100) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
