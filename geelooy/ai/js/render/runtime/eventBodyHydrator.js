//B"H
import { renderEventBody } from "../eventBody.js";
import { readEventPayload } from "./eventPayloadVault.js";
import { vaultCollapsedPanels } from "./collapsedDomVault.js";
import { reconcileThoughtInnerEvents } from "./thoughtInnerReconciler.js";
import { preservePanelScroll } from "./scrollAnchor.js";
import { usefulInnerEvents } from "./innerEventFilter.js";

const INNER_WINDOW = 40;

/**
 * Chapter 77: The Vault Opened Without Throwing The Reader Backward.
 *
 * Every expandable event owns its own vaulted payload key. Opening hydrates only
 * that payload into DOM; closing removes the heavy body completely. The scroll
 * anchor guards the reader's eye while the Awtsmoos folds or unfolds whole
 * chambers from memory into visible form.
 *
 * @param {Element} root Event region root.
 * @returns {void}
 */
export function installEventBodyHydrator(root) {
  if (!root || root.__awtsmoosEventBodyHydrator) return;
  root.__awtsmoosEventBodyHydrator = true;
  root.addEventListener("toggle", event => handleToggle(event.target), true);
  root.addEventListener("click", event => handleClick(event), true);
}

/**
 * Hydrates panels that streaming reconciliation restored as already-open shells.
 *
 * @param {ParentNode} root Re-rendered event entry or region.
 * @returns {void}
 */
export function hydrateOpenEventBodies(root) {
  if (!root?.querySelectorAll) return;
  root.querySelectorAll("details.transport-details[data-event-payload-key][open]").forEach(panel => {
    if (!panel.querySelector(":scope > .event-lanes")) hydrateEvent(panel);
  });
  root.querySelectorAll("details.thought-envelope-events[open]").forEach(panel => {
    if (!panel.querySelector(":scope > .thought-inner-window")) hydrateInner(panel);
  });
}

function handleToggle(panel) {
  if (panel?.matches?.("details.transport-details[data-event-payload-key]")) {
    preservePanelScroll(panel, () => panel.open ? hydrateEvent(panel) : removeBody(panel, ".event-lanes"));
  }
  if (panel?.matches?.("details.thought-envelope-events")) {
    preservePanelScroll(panel, () => panel.open ? hydrateInner(panel) : removeBody(panel, ".thought-inner-window"));
  }
}

function handleClick(event) {
  const button = event.target?.closest?.("[data-thought-window]");
  if (!button) return;
  event.preventDefault();
  const panel = button.closest("details.thought-envelope-events");
  if (panel) preservePanelScroll(panel, () => hydrateInner(panel, Number(button.dataset.thoughtWindow || 0)));
}

async function hydrateEvent(panel) {
  if (panel.querySelector(":scope > .event-lanes")) return;
  panel.append(loadingNode("Interpreting event…"));
  const payload = await readEventPayload(panel.dataset.eventPayloadKey);
  panel.querySelector(":scope > .event-hydration-loading")?.remove();
  if (!panel.open) return;
  panel.insertAdjacentHTML("beforeend", renderEventBody(payload || {}, { rawKey: `${panel.dataset.eventPayloadKey || "event"}::raw` }));
  vaultCollapsedPanels(panel);
}

async function hydrateInner(panel, offset = 0) {
  const existing = panel.querySelector(":scope > .thought-inner-window");
  const sameOffset = Number(panel.dataset.thoughtOffset || 0) === Number(offset || 0);
  if (existing && sameOffset) return;
  panel.dataset.thoughtOffset = String(offset || 0);
  if (!existing) panel.append(loadingNode("Loading inner thought timeline…"));
  const envelope = panel.closest(".thought-envelope-card");
  const event = await readEventPayload(envelope?.dataset?.thoughtEnvelopeKey);
  panel.querySelector(":scope > .event-hydration-loading")?.remove();
  if (!panel.open) return;
  const inner = usefulInnerEvents(Array.isArray(event?.raw?.events) ? event.raw.events : []);
  if (!inner.length) return showEmptyInner(panel, "No useful inner events are currently available for this thought bubble.");
  const end = Math.max(0, inner.length - offset);
  const start = Math.max(0, end - INNER_WINDOW);
  if (!existing) {
    const body = document.createElement("div");
    body.className = "thought-inner-window";
    panel.append(body);
  }
  panel.dataset.thoughtWindowEnd = String(end);
  reconcileThoughtInnerEvents(panel, inner.slice(start, end));
  const body = panel.querySelector(":scope > .thought-inner-window");
  if (start > 0 && body && !body.querySelector(":scope > .thought-window-more")) body.prepend(moreButton(offset + INNER_WINDOW));
  vaultCollapsedPanels(panel);
}

function showEmptyInner(panel, text) {
  let body = panel.querySelector(":scope > .thought-inner-window");
  if (!body) {
    body = document.createElement("div");
    body.className = "thought-inner-window";
    panel.append(body);
  }
  if (!body.children.length) {
    const empty = document.createElement("div");
    empty.className = "event-hydration-loading";
    empty.textContent = text;
    body.append(empty);
  }
}

function moreButton(offset) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "thought-window-more";
  button.dataset.thoughtWindow = String(offset);
  button.textContent = "Load earlier inner events";
  return button;
}

function removeBody(panel, selector) {
  panel.querySelector(`:scope > ${selector}`)?.remove();
  panel.querySelector(":scope > .event-hydration-loading")?.remove();
}

function loadingNode(text) {
  const node = document.createElement("div");
  node.className = "event-hydration-loading";
  node.textContent = text;
  return node;
}
