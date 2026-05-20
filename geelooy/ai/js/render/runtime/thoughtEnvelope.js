//B"H

const THOUGHT_KIND = new Set(["thinking", "hidden", "awtsmoos_tool", "agent_tool", "tool_call", "tool_result", "raw"]);

/**
 * Chapter 22: The Scattered Sparks Entered One Chamber.
 *
 * The outer Thoughts vessel is only a container, not a second transcript. Each
 * spark keeps its own expandable body inside the chamber, so text is not
 * copied upward into one giant monolith and then repeated below.
 *
 * @param {{kind?:string,label?:string,text?:string,raw?:object}[]} events Ordered render events.
 * @returns {Array} Events with one grouped thoughts capsule plus outer events.
 */
export function envelopeThoughtEvents(events = []) {
  const thoughtEvents = [];
  const outside = [];
  for (const event of events) {
    const expanded = expandThoughtEvent(event);
    const innerThoughts = expanded.filter(belongsInThoughtEnvelope);
    if (innerThoughts.length) thoughtEvents.push(...innerThoughts);
    else outside.push(event);
  }
  if (!thoughtEvents.length) return outside;
  return [makeEnvelope(thoughtEvents), ...outside];
}

function expandThoughtEvent(event = {}) {
  if (Array.isArray(event.raw?.events) && (event.raw.grouped || event.raw.groupedThoughtEnvelope)) return event.raw.events;
  return [event];
}

function makeEnvelope(events) {
  return {
    kind: "thinking",
    label: `Thoughts · ${events.length} event${events.length === 1 ? "" : "s"}`,
    text: "",
    raw: { groupedThoughtEnvelope: true, events }
  };
}

function belongsInThoughtEnvelope(event = {}) {
  if (!THOUGHT_KIND.has(event.kind)) return false;
  if (event.kind === "raw") return /thought|reasoning|analysis/i.test(signature(event));
  return true;
}

function signature(event = {}) {
  const raw = event.raw || {};
  return `${event.label || ""} ${raw.type || ""} ${raw.event || ""}`;
}
