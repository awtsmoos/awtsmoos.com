//B"H
import { toolHeadline } from "../event-ui/toolHeadline.js";

const TOOL_KINDS = new Set([
  "tool_call", "tool_result", "agent_tool", "awtsmoos_tool",
  "awtsmoos_tool_result", "function_call", "function_result"
]);

/**
 * Chapter 227: The Tool Group Counted Souls, Not Echoes.
 *
 * Provider streams may emit partial tool-call deltas, final assembled calls, and
 * tunnel result echoes. The group must show the number of unique calls, not the
 * number of packets. Chronology remains append-only; counting becomes sane.
 */
export function buildEventTimeline(events = []) {
  const timeline = [];
  for (const event of events.filter(Boolean)) appendTimelineEvent(timeline, event);
  return timeline.map((item, index) => finalizeTimelineItem(item, index));
}

export function isTimelineToolGroup(event = {}) {
  return Boolean(event.raw?.timelineToolGroup);
}

function appendTimelineEvent(timeline, event) {
  if (isToolEvent(event)) return appendTool(timeline, event);
  if (isThoughtEvent(event)) return appendThought(timeline, event);
  if (isToolStatus(event)) return appendTool(timeline, event);
  timeline.push(event);
}

function appendThought(timeline, event) {
  timeline.push({ ...event, raw: { ...(event.raw || {}), standaloneThoughtText: true } });
}

function appendTool(timeline, event) {
  const last = timeline[timeline.length - 1];
  if (last?.raw?.timelineToolGroup) {
    last.raw.events.push(event);
    last.text = groupText(last.raw.events);
    return;
  }
  timeline.push(makeToolGroup([event], timeline.length));
}

function makeToolGroup(events, index) {
  return {
    kind: "tool_group",
    label: "Calling tools",
    text: groupText(events),
    order: events[0]?.order || Number.MAX_SAFE_INTEGER,
    raw: { timelineToolGroup: true, timelineKey: `tool-group::${index}`, events }
  };
}

function finalizeTimelineItem(item, index) {
  if (!item.raw?.timelineToolGroup) return item;
  const events = item.raw.events || [];
  return {
    ...item,
    label: toolGroupLabel(events),
    text: groupText(events),
    raw: { ...item.raw, timelineKey: item.raw.timelineKey || `tool-group::${index}` }
  };
}

function toolGroupLabel(events = []) {
  const latest = latestToolName(events);
  const count = callCount(events);
  return `Calling tools · ${count} tool${count === 1 ? "" : "s"}${latest ? ` · latest ${latest}` : ""}`;
}

function groupText(events = []) {
  const latest = latestToolName(events);
  const count = callCount(events);
  return `${count} tool${count === 1 ? "" : "s"}${latest ? ` · latest: ${latest}` : ""}`;
}

function latestToolName(events = []) {
  const latest = [...events].reverse().find(isToolCallEvent) || [...events].reverse().find(isToolEvent);
  if (!latest) return "";
  return cleanAction(toolHeadline(latest).action || latest.label || latest.kind);
}

function callCount(events = []) {
  const calls = events.filter(isToolCallEvent);
  const unique = new Set(calls.map(toolIdentity));
  return Math.max(1, unique.size || events.filter(isToolEvent).length);
}

function toolIdentity(event = {}) {
  const raw = event.raw || {};
  const call = raw.call || {};
  return raw.tool_call_id || call.id || call.name || call.function?.name || event.label || event.text || event.kind;
}

function cleanAction(value = "") {
  return String(value || "tool").replace(/^response\s*·\s*/i, "").trim() || "tool";
}

function isThoughtEvent(event = {}) {
  return event.kind === "thinking" && Boolean(String(event.text || "").trim());
}

function isToolCallEvent(event = {}) {
  return /call|agent_tool|awtsmoos_tool$|function_call/i.test(event.kind || "");
}

function isToolEvent(event = {}) {
  return TOOL_KINDS.has(event.kind);
}

function isToolStatus(event = {}) {
  if (event.kind !== "status") return false;
  return /tool|running|call|function/i.test(`${event.label || ""} ${event.text || ""}`);
}
