//B"H
import { renderEventDetails } from "../eventDetails.js";
import { streamingToolKey } from "./toolStreamIdentity.js";
import { applyPendingWhenClosed, holdOpenVessel } from "./thoughtVesselStability.js";

/**
 * Chapter 64: The Chamber Remembered The Whole March.
 *
 * A thought group is not a visibility filter; it is a chronological chamber.
 * The first thought-text opens the gate, each following tool/function/action
 * marches inside it, and the next thought-text opens the next gate. This
 * reconciler keeps existing DOM vessels alive while the stream breathes, so a
 * user's nested scrollbar is not thrown back to the beginning every heartbeat.
 *
 * @param {Element} panel Thought inner details panel.
 * @param {Array<object>} inner Raw grouped inner events in exact timeline order.
 * @returns {void}
 */
export function reconcileThoughtInnerEvents(panel, inner = []) {
  const body = ensureBody(panel);
  if (!body) return;
  installPendingUpdateGate(body);
  const scrollState = snapshotScrollState(body);
  removeLegacyDirectCards(body);
  const liveKeys = new Set();
  let cursor = null;
  for (const [index, event] of inner.entries()) cursor = renderInnerVessel(body, liveKeys, cursor, event, index, index === inner.length - 1);
  freezeCompletedInnerVessels(body, cursor);
  pruneDeadVessels(body, liveKeys);
  restoreScrollState(body, scrollState);
}

function installPendingUpdateGate(body) {
  if (body.dataset.pendingUpdateGate === "installed") return;
  body.dataset.pendingUpdateGate = "installed";
  body.addEventListener("toggle", event => {
    const vessel = event.target?.closest?.(".thought-inner-event-vessel");
    if (vessel) applyPendingWhenClosed(vessel);
  }, true);
}

function ensureBody(panel) {
  if (!panel?.open) return null;
  let body = panel.querySelector(":scope > .thought-inner-window");
  if (!body) {
    body = document.createElement("div");
    body.className = "thought-inner-window";
    panel.append(body);
  }
  return body;
}

function renderInnerVessel(body, liveKeys, cursor, event, index, isLatest = false) {
  const key = innerEventKey(event, index);
  liveKeys.add(key);
  const html = renderEventDetails([event], { nested: true, stableKeyPrefix: `thought-inner::${key}` });
  let vessel = body.querySelector(`:scope > [data-inner-event-key="${cssEscape(key)}"]`);
  const isNew = !vessel;
  if (!vessel) {
    vessel = document.createElement("div");
    vessel.className = "thought-inner-event-vessel";
    vessel.dataset.innerEventKey = key;
  }
  placeAfter(body, vessel, cursor);
  if (vessel.dataset.innerEventHtml !== html) {
    if (!isNew && vessel.dataset.innerEventFrozen === "true") return vessel;
    if (!isNew && !isLatest) {
      vessel.dataset.innerEventFrozen = "true";
      return vessel;
    }
    if (holdOpenVessel(vessel, html)) return vessel;
    const vesselState = snapshotScrollState(vessel);
    const openState = snapshotOpenState(vessel);
    vessel.innerHTML = html;
    vessel.dataset.innerEventHtml = html;
    if (!isLatest) vessel.dataset.innerEventFrozen = "true";
    else delete vessel.dataset.innerEventFrozen;
    restoreOpenState(vessel, openState);
    restoreScrollState(vessel, vesselState);
  }
  return vessel;
}

function placeAfter(body, vessel, previous) {
  const expected = previous ? previous.nextSibling : body.firstChild;
  if (expected === vessel) return;
  body.insertBefore(vessel, expected || null);
}

function freezeCompletedInnerVessels(body, latest) {
  for (const vessel of [...body.querySelectorAll(":scope > .thought-inner-event-vessel")]) {
    if (vessel !== latest) vessel.dataset.innerEventFrozen = "true";
  }
}

function pruneDeadVessels(body, liveKeys) {
  for (const vessel of [...body.querySelectorAll(":scope > .thought-inner-event-vessel")]) {
    if (!liveKeys.has(vessel.dataset.innerEventKey || "")) vessel.remove();
  }
}

function removeLegacyDirectCards(body) {
  for (const child of [...body.children]) {
    if (child.classList.contains("thought-inner-event-vessel")) continue;
    if (child.classList.contains("thought-window-more")) continue;
    child.remove();
  }
}

function innerEventKey(event = {}, index = 0) {
  const streamKey = streamingToolKey(event);
  if (streamKey) return streamKey;
  const raw = event.raw || event;
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const stable = msg.id || raw.id || raw.message_id || raw.parent || raw.call_id || raw.tool_call_id;
  if (stable) return [event.kind, event.label, stable].filter(Boolean).join("::");
  return [event.kind || "event", event.label || "inner", `position-${index}`].join("::");
}

function snapshotScrollState(root) {
  const nodes = [root, ...root.querySelectorAll?.(".thought-inner-window, .event-payload, .event-code-block, .event-lanes, .event-long, pre, code") || []];
  return nodes.map((node, index) => ({ key: scrollKey(node, index), top: node.scrollTop || 0, left: node.scrollLeft || 0 }));
}

function restoreScrollState(root, state = []) {
  if (!state.length) return;
  const nodes = [root, ...root.querySelectorAll?.(".thought-inner-window, .event-payload, .event-code-block, .event-lanes, .event-long, pre, code") || []];
  const byKey = new Map(state.map(item => [item.key, item]));
  nodes.forEach((node, index) => {
    const saved = byKey.get(scrollKey(node, index));
    if (!saved) return;
    node.scrollTop = saved.top;
    node.scrollLeft = saved.left;
  });
}

function snapshotOpenState(root) {
  return [...root.querySelectorAll?.("details[open]") || []].map((detail, index) => openKey(detail, index));
}

function restoreOpenState(root, keys = []) {
  if (!keys.length) return;
  const set = new Set(keys);
  [...root.querySelectorAll?.("details") || []].forEach((detail, index) => {
    if (set.has(openKey(detail, index))) detail.open = true;
  });
}

function scrollKey(node, index) {
  return node.dataset?.innerEventKey || node.dataset?.persistKey || node.dataset?.eventPayloadKey || node.className || node.tagName || String(index);
}

function openKey(detail, index) {
  return detail.dataset?.innerEventKey || detail.dataset?.persistKey || detail.dataset?.eventPayloadKey || detail.className || String(index);
}

function cssEscape(value = "") {
  if (globalThis.CSS?.escape) return CSS.escape(String(value));
  return String(value).replace(/["\\]/g, "\\$&");
}
