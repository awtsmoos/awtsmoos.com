//B"H
import { renderEventDetails } from "../eventDetails.js";
import { streamingToolKey } from "./toolStreamIdentity.js";

/**
 * Chapter 64: The Chamber Remembered The Whole March.
 *
 * A thought group is not a visibility filter; it is a chronological chamber.
 * The first thought-text opens the gate, each following tool/function/action
 * marches inside it, and the next thought-text opens the next gate. This
 * reconciler merely gives the opened gate a stable DOM body and keeps its
 * children ordered by the group's real timeline.
 *
 * @param {Element} panel Thought inner details panel.
 * @param {Array<object>} inner Raw grouped inner events in exact timeline order.
 * @returns {void}
 */
export function reconcileThoughtInnerEvents(panel, inner = []) {
  const body = ensureBody(panel);
  if (!body) return;
  removeLegacyDirectCards(body);
  const liveKeys = new Set();
  for (const [index, event] of inner.entries()) renderInnerVessel(body, liveKeys, event, index);
  pruneDeadVessels(body, liveKeys);
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

function renderInnerVessel(body, liveKeys, event, index) {
  const key = innerEventKey(event, index);
  liveKeys.add(key);
  const html = renderEventDetails([event], { nested: true });
  let vessel = body.querySelector(`:scope > [data-inner-event-key="${cssEscape(key)}"]`);
  if (!vessel) {
    vessel = document.createElement("div");
    vessel.className = "thought-inner-event-vessel";
    vessel.dataset.innerEventKey = key;
  }
  body.append(vessel);
  if (vessel.dataset.innerEventHtml !== html) {
    vessel.innerHTML = html;
    vessel.dataset.innerEventHtml = html;
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

function cssEscape(value = "") {
  if (globalThis.CSS?.escape) return CSS.escape(String(value));
  return String(value).replace(/["\\]/g, "\\$&");
}
