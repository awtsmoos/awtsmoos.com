//B"H

const THOUGHT_ACTION_KIND = new Set([
  "awtsmoos_tool",
  "awtsmoos_tool_result",
  "agent_tool",
  "tool_call",
  "tool_result",
  "function_call",
  "function_result",
  "code",
  "raw",
  "hidden"
]);

/**
 * Chapter 74: Before The First Word, The Tools Already Marched.
 *
 * A thought chamber may begin as pure action when no thought-text has yet
 * spoken. The instant a real thought-text appears, it becomes the head of a new
 * chamber. After that, all tools/functions/results march beneath that head
 * until the next thought-text cleaves reality and opens another chamber.
 *
 * @param {{kind?:string,label?:string,text?:string,raw?:object}[]} events Ordered render events.
 * @returns {Array<object>} Chronological thought/action envelopes.
 */
export function envelopeThoughtEvents(events = []) {
  const output = [];
  let active = [];
  for (const event of events) {
    for (const inner of expandThoughtEvent(event)) active = consume(output, active, inner);
  }
  flush(output, active);
  return output;
}

function consume(output, active, event) {
  if (startsTextThought(event)) {
    flush(output, active);
    return [event];
  }
  if (belongsInThoughtChamber(event)) return [...active, event];
  flush(output, active);
  output.push(event);
  return [];
}

function flush(output, active) {
  if (!active?.length) return;
  output.push(makeEnvelope(active.splice(0), output.length));
}

function expandThoughtEvent(event = {}) {
  if (Array.isArray(event.raw?.events) && (event.raw.grouped || event.raw.groupedThoughtEnvelope)) return event.raw.events;
  return [event];
}

function startsTextThought(event = {}) {
  return event.kind === "thinking" && Boolean(String(event.text || "").trim());
}

function belongsInThoughtChamber(event = {}) {
  if (event.kind === "thinking") return Boolean(String(event.text || "").trim());
  if (!THOUGHT_ACTION_KIND.has(event.kind)) return false;
  if (event.kind === "raw") return /thought|reasoning|analysis|tool|function|action/i.test(signature(event));
  return true;
}

function makeEnvelope(events, index = 0) {
  return {
    kind: "thinking",
    label: `Thoughts · ${events.length} event${events.length === 1 ? "" : "s"}`,
    text: "",
    raw: { groupedThoughtEnvelope: true, groupKey: envelopeGroupKey(events, index), events }
  };
}

function envelopeGroupKey(events = [], index = 0) {
  const first = events[0] || {};
  const raw = first.raw || first;
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const stable = msg.id || raw.id || raw.message_id || raw.parent || raw.call_id || raw.tool_call_id;
  if (stable) return `thought-envelope::${stable}`;
  return `thought-envelope::${index}`;
}

function signature(event = {}) {
  const raw = event.raw || {};
  return `${event.label || ""} ${raw.type || ""} ${raw.event || ""}`;
}
