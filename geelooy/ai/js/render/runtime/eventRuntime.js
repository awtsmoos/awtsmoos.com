//B"H
import { renderEventDetails } from "../eventDetails.js";
import { dedupeEvents, eventMergeKey } from "./renderHelpers.js";
import { installRawJsonHydrator } from "./rawJsonHydrator.js";
import { groupReasoningEvents } from "./reasoningGrouper.js";
import { envelopeThoughtEvents } from "./thoughtEnvelope.js";
import { installPanelChrome } from "./panelChrome.js";
import { visibleEvents } from "./eventVisibilityRuntime.js";
import { installCollapsedDomVault, vaultCollapsedPanels } from "./collapsedDomVault.js";
import { installEventBodyHydrator } from "./eventBodyHydrator.js";

/**
 * B"H — Events are living retractable traces.
 *
 * Streaming re-renders the same thought chamber many times as new sparks come
 * in. This reconciler replaces stale event nodes by key, so old one-event
 * chambers do not remain beside the newer full chamber.
 */
export function renderEventRegion(shell, events = [], record = null) {
  const region = ensureRegion(shell);
  installRawJsonHydrator(region);
  installPanelChrome(region);
  installCollapsedDomVault(region);
  installEventBodyHydrator(region);
  installEventBodyHydrator(region);
  installCollapsedDomVault(region);
  const nodes = record ? (record.renderedEventNodes ||= new Map()) : new Map();
  const visible = visibleEvents(envelopeThoughtEvents(groupReasoningEvents(events)));
  reconcileNodes(region, nodes, visible);
  if (!visible.length) return region;
  for (const event of visible) renderOneEvent(region, nodes, event);
  return region;
}

export function refreshEventsLive(renderer, record) {
  if (!record.shell || !record.shell.isConnected) return renderer.appendLiveRecord(record);
  const cleanEvents = dedupeEvents(record.events || []);
  if (!cleanEvents.length) return clearEvents(record);
  renderEventRegion(record.shell, cleanEvents, record);
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
  const html = renderEventDetails([event]);
  let node = nodes.get(key);
  if (!node || !node.isConnected) {
    node = document.createElement("div");
    node.className = "event-entry";
    node.dataset.eventKey = key;
    nodes.set(key, node);
    region.appendChild(node);
  }
  if (node.dataset.eventHtml === html) return;
  const openKeys = snapshotOpenDetails(node);
  node.innerHTML = html;
  node.dataset.eventHtml = html;
  restoreOpenDetails(node, openKeys);
  vaultCollapsedPanels(node);
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
