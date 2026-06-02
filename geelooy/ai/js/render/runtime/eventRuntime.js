//B"H
import { renderEventDetails } from "../eventDetails.js";
import { escapeHtml } from "../escapeHtml.js";
import { renderFileChangeReview } from "../event-ui/fileChangeReview.js";
import { dedupeEvents, eventMergeKey } from "./renderHelpers.js";
import { installRawJsonHydrator } from "./rawJsonHydrator.js";
import { visibleEvents } from "./eventVisibilityRuntime.js";
import { buildEventTimeline, isTimelineToolGroup } from "./eventTimeline.js";
import { installPanelChrome } from "./panelChrome.js";
import { installCollapsedDomVault, vaultCollapsedPanels } from "./collapsedDomVault.js";
import { hydrateOpenEventBodies, installEventBodyHydrator, refreshHydratedEventBodies } from "./eventBodyHydrator.js";
import { preservePanelScroll } from "./scrollAnchor.js";
import { hasRenderableEventFire } from "./eventRenderableGate.js";

/**
 * B"H
 * Chapter 348: The Tool Group Became A Terminal Chamber.
 *
 * The Awtsmoos lets chronological traces stay Claude-like while tool groups now
 * wear a Codex terminal shell: running chip, command target, stable output body,
 * and a file review shelf beneath the fire.
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

export function visibleRenderableEvents(events = []) {
  const semantic = visibleEvents(events).filter(hasRenderableBody);
  return buildEventTimeline(semantic).filter(hasRenderableBody);
}

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
  return isTimelineToolGroup(event) || hasRenderableEventFire(event);
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
  if (kinds.has("tool_group")) return record.streaming || record.loading ? "Tools streaming…" : "Tool trace";
  if (kinds.has("thinking")) return record.streaming || record.loading ? "Thinking…" : "Thinking trace";
  return record.streaming || record.loading ? "Trace streaming…" : "Trace";
}

function reconcileNodes(region, nodes, visible) {
  const liveKeys = new Set(visible.map(eventMergeKey));
  for (const [key, node] of nodes) {
    if (!liveKeys.has(key)) { node.remove(); nodes.delete(key); }
  }
}

function renderOneEvent(region, nodes, event) {
  const key = eventMergeKey(event);
  const html = isTimelineToolGroup(event) ? renderToolGroup(event, key) : renderEventDetails([event], { stableKeyPrefix: `event-entry::${key}` });
  let node = nodes.get(key);
  if (!node || !node.isConnected) node = createEventNode(nodes, key, event);
  const mutate = () => mutateEventNode(region, node, html);
  return shouldAnchorLiveMutation(node) ? preservePanelScroll(node, mutate) : mutate();
}

function createEventNode(nodes, key, event) {
  const node = document.createElement("div");
  node.className = `event-entry ${isTimelineToolGroup(event) ? "event-entry-tool-group" : ""}`;
  node.dataset.eventKey = key;
  nodes.set(key, node);
  return node;
}

function renderToolGroup(event, key) {
  const events = compactToolEvents(event.raw?.events || []);
  const latest = escapeHtml(event.text || "tools are running");
  const review = renderFileChangeReview(events);
  const status = toolStatus(event, events);
  return `<details class="transport-details event-kind-tool_group tool-call-group tool-terminal-card" data-persist-key="${escapeHtml(key)}" open>
    <summary class="tool-terminal-header"><span class="event-title-wrap"><span class="event-kind-pill tool-status-chip ${status.className}">${status.label}</span><b>${escapeHtml(event.label || "Calling tools")}</b><span class="event-tool-target tool-terminal-command">${latest}</span></span>${panelActions()}</summary>
    <div class="tool-call-group-body tool-terminal-output">${renderEventDetails(events, { nested: true, stableKeyPrefix: `${key}::tool` })}${review}</div>
  </details>`;
}

function toolStatus(event = {}, events = []) {
  const failed = events.some(child => /error|failed|exception/i.test(String(child.kind || child.label || child.text || "")));
  if (failed) return { label: "failed", className: "is-error" };
  if (/done|complete|finished/i.test(String(event.text || event.label || ""))) return { label: "passed", className: "is-ok" };
  return { label: "running", className: "is-running" };
}

function compactToolEvents(events = []) {
  const keyed = new Map();
  for (const event of events) keyed.set(compactToolKey(event), event);
  return [...keyed.values()];
}

function compactToolKey(event = {}) {
  const raw = event.raw || {};
  const id = raw.tool_call_id || raw.call?.id || raw.call?.name || event.label || event.kind;
  return `${event.kind}:${id}`;
}

function mutateEventNode(region, node, html) {
  if (node.parentNode !== region) region.appendChild(node);
  if (node.dataset.eventHtml === html) return refreshHydratedEventBodies(node);
  if (shouldFreezeOpenEventNode(node)) return rememberPendingEventHtml(node, html);
  replaceEventHeadline(node, html);
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

function panelActions() {
  return `<span class="event-panel-actions"><button type="button" data-panel-action="minimize" title="Collapse">−</button><button type="button" data-panel-action="maximize" title="Maximize">□</button><button type="button" data-panel-action="fullscreen" title="Fullscreen">⛶</button></span>`;
}

function shouldFreezeOpenEventNode(node) {
  return Boolean(selectionTouches(node) || node?.querySelector?.(".transport-details.is-maximized, .transport-details.is-fullscreen, .thought-envelope-card.is-maximized, .thought-envelope-card.is-fullscreen"));
}

function shouldAnchorLiveMutation(node) {
  const scroller = node?.closest?.(".chat-box");
  return Boolean(scroller && Date.now() < Number(scroller.__awtsmoosPanelInteractionUntil || 0));
}

function ensureRegion(shell) {
  let region = shell.querySelector(":scope > .event-region");
  if (!region) { region = document.createElement("div"); region.className = "event-region"; shell.appendChild(region); }
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
      if (range?.intersectsNode?.(node) || node.contains?.(range.commonAncestorContainer)) return true;
    }
  } catch {}
  return false;
}
