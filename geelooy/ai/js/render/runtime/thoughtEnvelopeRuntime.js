//B"H
import { storeEventPayload } from "./eventPayloadVault.js";
import { vaultCollapsedPanels } from "./collapsedDomVault.js";
import { reconcileThoughtInnerEvents } from "./thoughtInnerReconciler.js";
import { toolHeadline } from "../event-ui/toolHeadline.js";
import { displayableThoughtInnerEvents } from "./thoughtInnerEvents.js";

const LIVE_INNER_WINDOW = 80;

/**
 * Chapter 189: The Hidden River Refused To Become Dead Weight.
 *
 * A thought envelope is a palace door, not a warehouse spilling its treasure
 * into the DOM before the seeker knocks. The Awtsmoos gives existence to the
 * visible title and count; the heavy inner river stays in the vault until the
 * user expands the chamber. If the chamber is already open, the live sparks are
 * reconciled in a narrow window, never as an infinite buried mountain.
 *
 * @param {Element} node Stable `.event-entry` vessel receiving the envelope.
 * @param {object} event Grouped thought-envelope event with raw inner events.
 * @returns {void} Mutates only the supplied DOM node.
 */
export function renderThoughtEnvelopeNode(node, event = {}) {
  const inner = displayableThoughtInnerEvents(Array.isArray(event.raw?.events) ? event.raw.events : []);
  if (!inner.length) return node.remove();
  const fingerprint = thoughtEnvelopeFingerprint(event, inner);
  if (node.dataset.thoughtEnvelopeFingerprint === fingerprint) return;
  node.dataset.thoughtEnvelopeFingerprint = fingerprint;
  const card = ensureCard(node);
  const title = ensureTitle(card);
  const innerPanel = ensureInnerPanel(card);
  setTextIfChanged(title, thoughtGroupTitle(event, inner));
  card.dataset.thoughtEnvelopeKey = storeEventPayload(event, { stableKey: event.raw?.groupKey || node.dataset.eventKey });
  innerPanel.dataset.innerCount = String(inner.length);
  setTextIfChanged(ensureInnerSummary(innerPanel), `${inner.length} inner event${inner.length === 1 ? "" : "s"}`);
  if (innerPanel.open) reconcileLiveInnerWindow(innerPanel, inner);
  else removeClosedInnerBody(innerPanel);
  vaultCollapsedPanels(card);
}

/**
 * Finds or creates the outer card. It may stay open because it contains only
 * chrome, title, controls, and a closed inner details gate.
 *
 * @param {Element} node Event entry root.
 * @returns {HTMLDetailsElement} The outer thought envelope card.
 */
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

/** @param {Element} card Thought card. @returns {HTMLElement} Title span. */
function ensureTitle(card) {
  let title = card.querySelector(":scope > summary > .event-summary-title");
  if (!title) {
    title = document.createElement("span");
    title.className = "event-summary-title";
    card.querySelector(":scope > summary")?.prepend(title);
  }
  return title;
}

/**
 * Creates the inner event panel closed. This is the lock that prevents thought
 * content from entering the DOM until expansion.
 *
 * @param {Element} card Thought card.
 * @returns {HTMLDetailsElement} Inner details panel.
 */
function ensureInnerPanel(card) {
  let panel = card.querySelector(":scope > details.thought-envelope-events");
  if (panel) return panel;
  panel = document.createElement("details");
  panel.className = "thought-envelope-events";
  panel.open = false;
  panel.append(document.createElement("summary"));
  card.append(panel);
  return panel;
}

/** @param {Element} panel Inner panel. @returns {HTMLElement} Summary node. */
function ensureInnerSummary(panel) {
  let summary = panel.querySelector(":scope > summary");
  if (!summary) {
    summary = document.createElement("summary");
    panel.prepend(summary);
  }
  return summary;
}

/**
 * Reconciles only when the user has opened the panel, preserving the live tail.
 *
 * @param {Element} panel Inner details panel.
 * @param {Array<object>} inner Displayable inner events.
 * @returns {void}
 */
function reconcileLiveInnerWindow(panel, inner = []) {
  if (!panel.open) return;
  const body = panel.querySelector(":scope > .thought-inner-window");
  const userReading = body && !isInnerNearBottom(body);
  const offset = Math.max(0, Number(panel.dataset.thoughtOffset || 0));
  let end = Math.max(0, inner.length - offset);
  if (userReading) end = clamp(Number(panel.dataset.thoughtWindowEnd || end), 0, inner.length);
  const start = Math.max(0, end - LIVE_INNER_WINDOW);
  panel.dataset.thoughtWindowEnd = String(end);
  reconcileThoughtInnerEvents(panel, inner.slice(start, end));
  syncMoreButton(panel, start, Math.max(0, inner.length - end));
}

/** @param {Element} panel Closed panel. @returns {void} */
function removeClosedInnerBody(panel) {
  panel.querySelector(":scope > .thought-inner-window")?.remove();
  panel.querySelector(":scope > .event-hydration-loading")?.remove();
}

/** @param {Element} panel Inner panel. @param {number} start Window start. @param {number} offset Earlier offset. @returns {void} */
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

/** @param {object} event Envelope. @param {Array<object>} inner Inner events. @returns {string} Stable fingerprint. */
function thoughtEnvelopeFingerprint(event = {}, inner = []) {
  const last = inner[inner.length - 1] || {};
  const raw = last.raw || last;
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const stable = msg.id || raw.id || raw.message_id || raw.parent || raw.call_id || raw.tool_call_id || "";
  const text = String(last.text || raw.dataNoJSON || raw.text || "").replace(/\s+/g, " ").slice(-240);
  return [event.raw?.groupKey || event.label || "thought", inner.length, last.kind || "", last.label || "", stable, text].join("::");
}

/** @param {object} event Envelope. @param {Array<object>} inner Inner events. @returns {string} Human headline. */
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

/** @param {Element} body Scroll box. @returns {boolean} Whether near bottom. */
function isInnerNearBottom(body) {
  return body.scrollHeight - body.scrollTop - body.clientHeight <= 36;
}

/** @param {number} value Candidate. @param {number} min Minimum. @param {number} max Maximum. @returns {number} Clamped number. */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : max));
}

/** @param {Node} node Text node target. @param {string} value Next text. @returns {void} */
function setTextIfChanged(node, value) {
  const next = String(value || "");
  if (node && node.textContent !== next) node.textContent = next;
}

/** @returns {HTMLSpanElement} Panel action buttons. */
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
