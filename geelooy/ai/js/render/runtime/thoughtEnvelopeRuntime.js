//B"H
import { storeEventPayload } from "./eventPayloadVault.js";
import { vaultCollapsedPanels } from "./collapsedDomVault.js";
import { reconcileThoughtInnerEvents } from "./thoughtInnerReconciler.js";
import { toolHeadline } from "../event-ui/toolHeadline.js";

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
  const inner = Array.isArray(event.raw?.events) ? event.raw.events : [];
  const card = ensureCard(node);
  const title = ensureTitle(card);
  const innerPanel = ensureInnerPanel(card);
  title.textContent = thoughtGroupTitle(event, inner);
  card.dataset.thoughtEnvelopeKey = storeEventPayload(event, { stableKey: event.raw?.groupKey || node.dataset.eventKey });
  innerPanel.dataset.innerCount = String(inner.length);
  ensureInnerSummary(innerPanel).textContent = `${inner.length} inner event${inner.length === 1 ? "" : "s"}`;
  reconcileThoughtInnerEvents(innerPanel, inner);
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
  summary.append(title, chromeButtons());
  card.append(summary);
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
