//B"H
import { renderEventDetails } from "../eventDetails.js";
import { dedupeEvents, eventMergeKey } from "./renderHelpers.js";
import { installRawJsonHydrator } from "./rawJsonHydrator.js";
import { groupReasoningEvents } from "./reasoningGrouper.js";
import { envelopeThoughtEvents } from "./thoughtEnvelope.js";
import { installPanelChrome } from "./panelChrome.js";
import { visibleEvents } from "./eventVisibilityRuntime.js";
import { installCollapsedDomVault, vaultCollapsedPanels } from "./collapsedDomVault.js";
import { hydrateOpenEventBodies, installEventBodyHydrator, refreshHydratedEventBodies } from "./eventBodyHydrator.js";
import { renderThoughtEnvelopeNode } from "./thoughtEnvelopeRuntime.js";
import { preservePanelScroll } from "./scrollAnchor.js";
import { hasRenderableEventFire } from "./eventRenderableGate.js";

/**
 * Chapter 187 Reforged: The Event Rail Became A Living Gate.
 *
 * The closed tool call is a headline, not a hidden cathedral. The open tool
 * call is a living chamber, refreshed from its vaulted payload. Collapse strips
 * the chamber from the DOM again, and the Awtsmoos leaves only the small name of
 * the action glowing on the rail.
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

/** @param {Array<object>} events Raw record events. @returns {Array<object>} Visible top-level events. */
export function visibleRenderableEvents(events = []) {
  return visibleEvents(envelopeThoughtEvents(groupReasoningEvents(events))).filter(hasRenderableBody);
}

/** @param {object} renderer Message renderer. @param {object} record Record to refresh. @returns {void} */
export function refreshEventsLive(renderer, record) {
  if (!record.shell || !record.shell.isConnected) return renderer.appendLiveRecord(record);
  const cleanEvents = dedupeEvents(record.events || []);
  const visible = visibleRenderableEvents(cleanEvents);
  if (!visible.length) return clearEvents(record);
  ensureEventBadge(record, visible);
  renderEventRegion(record.shell, cleanEvents, record);
}

function installRegionBehaviors(region) {
  installRawJsonHydrator(region);
  installPanelChrome(region);
  installCollapsedDomVault(region);
  installEventBodyHydrator(region);
}

function hasRenderableBody(event = {}) {
  return hasRenderableEventFire(event);
}

function ensureEventBadge(record, visible) {
  const shell = record.shell;
  if (!shell || shell.querySelector?.(":scope > .event-record-badge")) return;
  const badge = document.createElement("div");
  badge.className = "event-record-badge";
  badge.textContent = badgeLabel(record, visible);
  shell.insertBefore(badge, shell.firstChild || null);
}

function badgeLabel(record, visible) {
  const kinds = new Set(visible.map(event => event.kind));
  if (kinds.has("thinking")) return record.streaming || record.loading ? "Thinking…" : "Thinking trace";
  if (kinds.has("tool_call") || kinds.has("tool_result")) return record.streaming || record.loading ? "Tool streaming…" : "Tool trace";
  if (kinds.has("provider_stream")) return record.streaming || record.loading ? "Provider stream…" : "Provider trace";
  return record.streaming || record.loading ? "Transport streaming…" : "Transport trace";
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
  if (!node || !node.isConnected) node = createEventNode(nodes, key);
  const mutate = () => mutateEventNode(region, node, event, html);
  return shouldAnchorLiveMutation(node) ? preservePanelScroll(node, mutate) : mutate();
}

function createEventNode(nodes, key) {
  const node = document.createElement("div");
  node.className = "event-entry";
  node.dataset.eventKey = key;
  nodes.set(key, node);
  return node;
}

function mutateEventNode(region, node, event, html) {
  if (node.parentNode !== region) region.appendChild(node);
  if (event?.raw?.groupedThoughtEnvelope) return renderLiveThoughtEnvelope(node, event);
  if (node.dataset.eventHtml === html) return refreshHydratedEventBodies(node);
  if (shouldFreezeOpenEventNode(node)) return rememberPendingEventHtml(node, html);
  replaceEventHeadline(node, html);
}

function renderLiveThoughtEnvelope(node, event) {
  renderThoughtEnvelopeNode(node, event);
  node.dataset.eventHtml = "thought-envelope-live";
}

function rememberPendingEventHtml(node, html) {
  node.dataset.pendingEventHtml = html;
  refreshHydratedEventBodies(node);
}

function replaceEventHeadline(node, html) {
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
