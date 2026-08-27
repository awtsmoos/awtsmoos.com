//B"H
import { renderEventBody } from "../eventBody.js";
import { readEventPayload } from "./eventPayloadVault.js";
import { vaultCollapsedPanels } from "./collapsedDomVault.js";
import { reconcileThoughtInnerEvents } from "./thoughtInnerReconciler.js";
import { preservePanelScroll } from "./scrollAnchor.js";
import { displayableThoughtInnerEvents } from "./thoughtInnerEvents.js";

const INNER_WINDOW = 40;

/**
 * Chapter 77 Reforged: The Open Gate Drank Only Living Drops.
 *
 * Closed panels contain only a headline. Open panels hydrate exactly one body,
 * and when the payload changes they refresh that body from the vault without
 * resurrecting every collapsed action. The Awtsmoos breathes through expansion,
 * not through hidden DOM weight.
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

/** @param {ParentNode} root Re-rendered event entry or region. @returns {void} */
export function hydrateOpenEventBodies(root) {
  if (!root?.querySelectorAll) return;
  root.querySelectorAll("details.transport-details[data-event-payload-key][open]").forEach(panel => {
    if (!panel.querySelector(":scope > .event-lanes")) hydrateEvent(panel);
  });
  root.querySelectorAll("details.thought-envelope-events[open]").forEach(panel => {
    if (!panel.querySelector(":scope > .thought-inner-window")) hydrateInner(panel);
  });
}

/**
 * Refreshes one already-open event panel from its latest stored payload.
 *
 * @param {ParentNode} root Event node that may contain an open panel.
 * @returns {void}
 */
export function refreshHydratedEventBodies(root) {
  if (!root?.querySelectorAll) return;
  root.querySelectorAll("details.transport-details[data-event-payload-key][open]").forEach(panel => hydrateEvent(panel, { refresh: true }));
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

async function hydrateEvent(panel, { refresh = false } = {}) {
  const existing = panel.querySelector(":scope > .event-lanes");
  if (existing && !refresh) return;
  if (!existing) panel.append(loadingNode("Interpreting event…"));
  const payload = await readEventPayload(panel.dataset.eventPayloadKey);
  panel.querySelector(":scope > .event-hydration-loading")?.remove();
  if (!panel.open) return;
  const html = renderEventBody(payload || {}, { rawKey: `${panel.dataset.eventPayloadKey || "event"}::raw` });
  if (panel.dataset.renderedEventBody === html && existing) return;
  panel.dataset.renderedEventBody = html;
  existing?.remove();
  panel.insertAdjacentHTML("beforeend", html);
  vaultCollapsedPanels(panel);
}

async function hydrateInner(panel, offset = 0) {
  const existing = panel.querySelector(":scope > .thought-inner-window");
  const sameOffset = Number(panel.dataset.thoughtOffset || 0) === Number(offset || 0);
  const empty = existing && !existing.querySelector(":scope > .thought-inner-event-vessel") && existing.querySelector(":scope > .event-hydration-loading");
  if (existing && sameOffset && !empty) return;
  panel.dataset.thoughtOffset = String(offset || 0);
  if (!existing) panel.append(loadingNode("Loading inner thought timeline…"));
  const envelope = panel.closest(".thought-envelope-card");
  const event = await readEventPayload(envelope?.dataset?.thoughtEnvelopeKey);
  panel.querySelector(":scope > .event-hydration-loading")?.remove();
  if (!panel.open) return;
  const inner = displayableThoughtInnerEvents(Array.isArray(event?.raw?.events) ? event.raw.events : []);
  if (!inner.length) return showEmptyInner(panel, "No useful inner events are currently available for this thought bubble.");
  const end = Math.max(0, inner.length - offset);
  const start = Math.max(0, end - INNER_WINDOW);
  if (!existing) panel.append(Object.assign(document.createElement("div"), { className: "thought-inner-window" }));
  panel.dataset.thoughtWindowEnd = String(end);
  reconcileThoughtInnerEvents(panel, inner.slice(start, end));
  const body = panel.querySelector(":scope > .thought-inner-window");
  if (start > 0 && body && !body.querySelector(":scope > .thought-window-more")) body.prepend(moreButton(offset + INNER_WINDOW));
  vaultCollapsedPanels(panel);
}

function showEmptyInner(panel, text) {
  let body = panel.querySelector(":scope > .thought-inner-window");
  if (!body) panel.append(body = Object.assign(document.createElement("div"), { className: "thought-inner-window" }));
  if (!body.children.length) body.append(loadingNode(text));
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
