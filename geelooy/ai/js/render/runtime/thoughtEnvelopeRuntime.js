//B"H
import { storeEventPayload } from "./eventPayloadVault.js";
import { vaultCollapsedPanels } from "./collapsedDomVault.js";
import { reconcileThoughtInnerEvents } from "./thoughtInnerReconciler.js";
import { toolHeadline } from "../event-ui/toolHeadline.js";

const LIVE_INNER_WINDOW = 80;

/**
 * Chapter 79: The Chamber Key Became A Bone That Did Not Melt.
 *
 * While streaming, a thought group receives more inner sparks. Its DOM card and
 * vault payload must keep the same identity, or an already-open panel may ask
 * yesterday's key for today's body and find only silence. The Awtsmoos gives
 * each group a stable key from its timeline head, and this runtime updates the
 * payload behind that same key until the group is complete.
 *
 * @param {Element} node Stable .event-entry vessel.
 * @param {object} event Grouped thought-envelope event.
 * @returns {void}
 */
export function renderThoughtEnvelopeNode(node, event = {}) {
  const inner = realInnerEvents(Array.isArray(event.raw?.events) ? event.raw.events : []);
  const fingerprint = thoughtEnvelopeFingerprint(event, inner);
  if (node.dataset.thoughtEnvelopeFingerprint === fingerprint) return;
  node.dataset.thoughtEnvelopeFingerprint = fingerprint;
  const card = ensureCard(node);
  const title = ensureTitle(card);
  const innerPanel = ensureInnerPanel(card);
  title.textContent = thoughtGroupTitle(event, inner);
  card.dataset.thoughtEnvelopeKey = storeEventPayload(event, { stableKey: event.raw?.groupKey || node.dataset.eventKey });
  innerPanel.dataset.innerCount = String(inner.length);
  ensureInnerSummary(innerPanel).textContent = `${inner.length} inner event${inner.length === 1 ? "" : "s"}`;
  reconcileLiveInnerWindow(innerPanel, inner);
  vaultCollapsedPanels(card);
}

function ensureCard(node) {
  let card = node.querySelector(":scope > details.thought-envelope-card");
  if (card) return card;
  node.textContent = "";
  card = document.createElement("details");
  card.className = "thought-envelope-card";
  card.open = true;
  const summary = document.createElement("summary");
  const title = document.createElement("span");
  title.className = "event-summary-title";
  summary.append(title);
  card.append(summary, chromeButtons());
  node.append(card);
  return card;
}

function ensureTitle(card) {
  let title = card.querySelector(":scope > summary > .event-summary-title");
  if (!title) {
    title = document.createElement("span");
    title.className = "event-summary-title";
    card.querySelector(":scope > summary")?.prepend(title);
  }
  return title;
}

function ensureInnerPanel(card) {
  let panel = card.querySelector(":scope > details.thought-envelope-events");
  if (panel) return panel;
  panel = document.createElement("details");
  panel.className = "thought-envelope-events";
  panel.append(document.createElement("summary"));
  card.append(panel);
  return panel;
}

function ensureInnerSummary(panel) {
  let summary = panel.querySelector(":scope > summary");
  if (!summary) {
    summary = document.createElement("summary");
    panel.prepend(summary);
  }
  return summary;
}

function reconcileLiveInnerWindow(panel, inner = []) {
  if (!panel.open) return;
  const body = panel.querySelector(":scope > .thought-inner-window");
  const userReading = body && !isInnerNearBottom(body);
  const offset = Math.max(0, Number(panel.dataset.thoughtOffset || 0));
  let end = Math.max(0, inner.length - offset);
  if (userReading) end = clamp(Number(panel.dataset.thoughtWindowEnd || end), 0, inner.length);
  const start = Math.max(0, end - LIVE_INNER_WINDOW);
  panel.dataset.thoughtWindowEnd = String(end);
  const windowed = inner.slice(start, end);
  reconcileThoughtInnerEvents(panel, windowed);
  syncMoreButton(panel, start, Math.max(0, inner.length - end));
}

function isInnerNearBottom(body) {
  return body.scrollHeight - body.scrollTop - body.clientHeight <= 36;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : max));
}

function syncMoreButton(panel, start, offset) {
  const body = panel.querySelector(":scope > .thought-inner-window");
  if (!body) return;
  let button = body.querySelector(":scope > .thought-window-more");
  if (start <= 0) return button?.remove();
  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.className = "thought-window-more";
    body.prepend(button);
  }
  button.dataset.thoughtWindow = String(offset + LIVE_INNER_WINDOW);
  button.textContent = "Load earlier inner events";
}

function realInnerEvents(inner = []) {
  return inner.filter(event => {
    const raw = event?.raw || event || {};
    const msg = raw.message || raw.input_message || raw.data?.message || raw;
    const content = msg.content || raw.content || {};
    const text = event?.text || raw.text || raw.dataNoJSON || content.text || (Array.isArray(content.parts) ? content.parts.join(" ") : "");
    return Boolean(String(text || "").trim() || msg.id || raw.id || raw.type || raw.name || msg.recipient || raw.recipient || event?.action?.href);
  });
}

function thoughtEnvelopeFingerprint(event = {}, inner = []) {
  const last = inner[inner.length - 1] || {};
  const raw = last.raw || last;
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const stable = msg.id || raw.id || raw.message_id || raw.parent || raw.call_id || raw.tool_call_id || "";
  const text = String(last.text || raw.dataNoJSON || raw.text || "").replace(/\s+/g, " ").slice(-240);
  return [event.raw?.groupKey || event.label || "thought", inner.length, last.kind || "", last.label || "", stable, text].join("::");
}

function thoughtGroupTitle(event = {}, inner = []) {
  const latest = [...inner].reverse().find(item => /tool|awtsmoos|function/i.test(item?.kind || ""));
  if (latest) {
    const info = toolHeadline(latest);
    const target = info.target && info.target !== info.action ? ` · ${info.target}` : "";
    return `Thinking · ${info.action}${target}`;
  }
  const thought = [...inner].reverse().find(item => item?.kind === "thinking" && String(item.text || "").trim());
  if (thought) return `Thinking · ${String(thought.text).trim().slice(0, 80)}`;
  return event.label || "Thoughts";
}

function chromeButtons() {
  const wrap = document.createElement("span");
  wrap.className = "event-panel-actions";
  for (const [action, title, text] of [["minimize", "Collapse", "−"], ["maximize", "Maximize", "▢"], ["fullscreen", "Fullscreen", "⛶"]]) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.panelAction = action;
    button.title = title;
    button.textContent = text;
    wrap.append(button);
  }
  return wrap;
}
