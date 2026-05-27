//B"H
import { renderEventDetails } from "../eventDetails.js";
import { dedupeEvents, eventMergeKey } from "./renderHelpers.js";
import { installRawJsonHydrator } from "./rawJsonHydrator.js";
import { groupReasoningEvents } from "./reasoningGrouper.js";
import { envelopeThoughtEvents } from "./thoughtEnvelope.js";
import { installPanelChrome } from "./panelChrome.js";
import { visibleEvents } from "./eventVisibilityRuntime.js";
import { installCollapsedDomVault, vaultCollapsedPanels } from "./collapsedDomVault.js";
import { hydrateOpenEventBodies, installEventBodyHydrator } from "./eventBodyHydrator.js";
import { renderThoughtEnvelopeNode } from "./thoughtEnvelopeRuntime.js";
import { preservePanelScroll } from "./scrollAnchor.js";

/**
 * Chapter 68: The Court Let The Thought Banner Stand.
 *
 * Rendering may hide top-level event kinds through settings, but once a real
 * thought-text has opened a chamber, the chamber is a chronological vessel.
 * Its render key and DOM node persist while following actions stream beneath
 * it, until another thought-text opens the next vessel.
 *
 * @param {Element} shell Message shell that owns the event region.
 * @param {Array<object>} events Raw record events in stream order.
 * @param {object|null} record Record that stores rendered event nodes.
 * @returns {Element} Stable event region.
 */
export function renderEventRegion(shell, events = [], record = null) {
  const region = ensureRegion(shell);
  installRegionBehaviors(region);
  const nodes = record ? (record.renderedEventNodes ||= new Map()) : new Map();
  const visible = visibleRenderableEvents(events);
  reconcileNodes(region, nodes, visible);
  for (const event of visible) renderOneEvent(region, nodes, event);
  return region;
}

/**
 * @param {Array<object>} events Raw record events.
 * @returns {Array<object>} Visible top-level events.
 */
export function visibleRenderableEvents(events = []) {
  return visibleEvents(envelopeThoughtEvents(groupReasoningEvents(events))).filter(hasRenderableBody);
}

/**
 * @param {object} renderer Message renderer.
 * @param {object} record Record to refresh.
 * @returns {void}
 */
export function refreshEventsLive(renderer, record) {
  if (!record.shell || !record.shell.isConnected) return renderer.appendLiveRecord(record);
  const cleanEvents = dedupeEvents(record.events || []);
  if (!visibleRenderableEvents(cleanEvents).length) return clearEvents(record);
  renderEventRegion(record.shell, cleanEvents, record);
}

function installRegionBehaviors(region) {
  installRawJsonHydrator(region);
  installPanelChrome(region);
  installCollapsedDomVault(region);
  installEventBodyHydrator(region);
}

/**
 * B"H — refuses to render empty ceremonial shells.
 *
 * Some transports emit action-after-thought husks with a label but no payload,
 * no text, and no nested events. Those ghosts became expandable dead bubbles.
 * This gate admits only events with real inner fire: text, action, raw payload,
 * tool identity, or a non-empty thought envelope.
 *
 * @param {object} event Candidate event.
 * @returns {boolean} True when the event can produce useful UI.
 */
function hasRenderableBody(event = {}) {
  if (event?.raw?.groupedThoughtEnvelope) return Array.isArray(event.raw.events) && event.raw.events.length > 0;
  const raw = event.raw || event;
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const content = msg.content || raw.content || {};
  const text = event.text || (Array.isArray(content.parts) ? content.parts.join(" ") : content.text) || raw.text || raw.dataNoJSON || "";
  return Boolean(String(text).trim() || event.action?.href || msg.recipient || raw.recipient || raw.type || raw.name || raw.id);
}

function reconcileNodes(region, nodes, visible) {
  const liveKeys = new Set(visible.map(eventMergeKey));
  for (const [key, node] of nodes) {
    if (!liveKeys.has(key)) {
      node.remove();
      nodes.delete(key);
    }
  }
}

function renderOneEvent(region, nodes, event) {
  const key = eventMergeKey(event);
  const html = renderEventDetails([event], { stableKeyPrefix: `event-entry::${key}` });
  let node = nodes.get(key);
  if (!node || !node.isConnected) {
    node = document.createElement("div");
    node.className = "event-entry";
    node.dataset.eventKey = key;
    nodes.set(key, node);
  }
  const mutate = () => mutateEventNode(region, node, event, html);
  return shouldAnchorLiveMutation(node) ? preservePanelScroll(node, mutate) : mutate();
}

function mutateEventNode(region, node, event, html) {
  region.appendChild(node);
  if (event?.raw?.groupedThoughtEnvelope) {
    renderThoughtEnvelopeNode(node, event);
    node.dataset.eventHtml = "thought-envelope-live";
    return;
  }
  if (node.dataset.eventHtml === html) return;
  if (shouldFreezeOpenEventNode(node)) {
    node.dataset.pendingEventHtml = html;
    return;
  }
  const openKeys = snapshotOpenDetails(node);
  const panelState = snapshotPanelState(node);
  node.innerHTML = html;
  node.dataset.eventHtml = html;
  restoreOpenDetails(node, openKeys);
  restorePanelState(node, panelState);
  hydrateOpenEventBodies(node);
  vaultCollapsedPanels(node);
}

function shouldFreezeOpenEventNode(node) {
  return Boolean(
    selectionTouches(node)
    || node?.querySelector?.("details[open], .transport-details.is-maximized, .transport-details.is-fullscreen, .thought-envelope-card.is-maximized, .thought-envelope-card.is-fullscreen")
  );
}

function shouldAnchorLiveMutation(node) {
  const scroller = node?.closest?.(".chat-box");
  return Boolean(scroller && Date.now() < Number(scroller.__awtsmoosPanelInteractionUntil || 0));
}

function ensureRegion(shell) {
  let region = shell.querySelector(":scope > .event-region");
  if (!region) {
    region = document.createElement("div");
    region.className = "event-region";
    shell.appendChild(region);
  }
  return region;
}

function clearEvents(record) {
  record.renderedEventNodes = new Map();
  record.shell?.querySelector(":scope > .event-region")?.remove();
}

function snapshotOpenDetails(node) {
  return [...node.querySelectorAll("details[open]")].map((detail, index) => detail.dataset.persistKey || detail.className || String(index));
}

function restoreOpenDetails(node, keys) {
  if (!keys.length) return;
  [...node.querySelectorAll("details")].forEach((detail, index) => {
    const key = detail.dataset.persistKey || detail.className || String(index);
    if (keys.includes(key)) detail.open = true;
  });
}

function snapshotPanelState(node) {
  const panel = node.querySelector(".transport-details, .thought-envelope-card");
  if (!panel) return null;
  return { maximized: panel.classList.contains("is-maximized"), fullscreen: panel.classList.contains("is-fullscreen"), panelState: panel.dataset.panelState || "" };
}

function restorePanelState(node, state) {
  if (!state) return;
  const panel = node.querySelector(".transport-details, .thought-envelope-card");
  if (!panel) return;
  panel.classList.toggle("is-maximized", Boolean(state.maximized));
  panel.classList.toggle("is-fullscreen", Boolean(state.fullscreen));
  if (state.panelState) panel.dataset.panelState = state.panelState;
  document.body.classList.toggle("has-event-fullscreen", Boolean(document.querySelector(".transport-details.is-fullscreen, .thought-envelope-card.is-fullscreen")));
}

function selectionTouches(node) {
  try {
    const selection = globalThis.getSelection?.();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return false;
    for (let index = 0; index < selection.rangeCount; index++) {
      const range = selection.getRangeAt(index);
      if (range?.intersectsNode?.(node)) return true;
      if (node.contains?.(range.commonAncestorContainer)) return true;
    }
  } catch {}
  return false;
}
