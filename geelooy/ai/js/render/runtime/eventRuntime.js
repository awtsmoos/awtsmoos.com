//B"H
import { renderEventDetails } from "../eventDetails.js";
import { dedupeEvents, eventMergeKey } from "./renderHelpers.js";

/**
 * B"H — Events are living retractable traces.
 *
 * New kinds append. Existing kinds update only when their payload actually
 * changes, while remembering which <details> panels the user opened.
 */
export function renderEventRegion(shell, events = [], record = null) {
  const region = ensureRegion(shell);
  const nodes = record ? (record.renderedEventNodes ||= new Map()) : new Map();
  for (const event of events) renderOneEvent(region, nodes, event);
  return region;
}

export function refreshEventsLive(renderer, record) {
  if (!record.shell || !record.shell.isConnected) return renderer.appendLiveRecord(record);
  const cleanEvents = dedupeEvents(record.events || []);
  if (!cleanEvents.length) return clearEvents(record);
  renderEventRegion(record.shell, cleanEvents, record);
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
