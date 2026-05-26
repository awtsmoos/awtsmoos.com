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
 * Chapter 114: The Thought Spoke As A Message; The Tools Walked Behind It.
 *
 * Text thoughts are no longer the collapsible head of a group. A real thought
 * text becomes its own top-level, non-collapsible message-like card. Every tool,
 * hidden/result/action event after it is gathered into a collapsible action
 * group until the next text thought appears. Then the cycle repeats.
 *
 * @param {{kind?:string,label?:string,text?:string,raw?:object}[]} events Ordered render events.
 * @returns {Array<object>} Chronological thought-text cards and action envelopes.
 */
export function envelopeThoughtEvents(events = []) {
  const output = [];
  let activeActions = [];
  for (const event of events) {
    for (const inner of expandThoughtEvent(event)) activeActions = consume(output, activeActions, inner);
  }
  flushActions(output, activeActions);
  return output;
}

function consume(output, activeActions, event) {
  if (isTextThought(event)) {
    flushActions(output, activeActions);
    output.push(markStandaloneThought(event));
    return [];
  }
  if (belongsInActionGroup(event)) return [...activeActions, event];
  flushActions(output, activeActions);
  output.push(event);
  return [];
}

function flushActions(output, activeActions) {
  if (!activeActions?.length) return;
  output.push(makeActionEnvelope(activeActions.splice(0), output.length));
}

function expandThoughtEvent(event = {}) {
  if (Array.isArray(event.raw?.events) && (event.raw.grouped || event.raw.groupedThoughtEnvelope)) return event.raw.events;
  return [event];
}

function isTextThought(event = {}) {
  return event.kind === "thinking" && Boolean(String(event.text || "").trim());
}

function markStandaloneThought(event = {}) {
  return {
    ...event,
    raw: { ...(event.raw || {}), standaloneThoughtText: true }
  };
}

function belongsInActionGroup(event = {}) {
  if (event.kind === "thinking") return false;
  if (THOUGHT_ACTION_KIND.has(event.kind)) {
    if (event.kind === "raw") return /thought|reasoning|analysis|tool|function|action/i.test(signature(event));
    return true;
  }
  if (event.kind === "status") return /thought|reasoning|analysis|tool|function|action|stream|message/i.test(signature(event));
  return false;
}

function makeActionEnvelope(events, index = 0) {
  return {
    kind: "thinking",
    label: `Actions after thought · ${events.length} event${events.length === 1 ? "" : "s"}`,
    text: "",
    raw: { groupedThoughtEnvelope: true, groupKey: envelopeGroupKey(events, index), events }
  };
}

function envelopeGroupKey(events = [], index = 0) {
  const first = events[0] || {};
  const raw = first.raw || first;
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const stable = msg.id || raw.id || raw.message_id || raw.parent || raw.call_id || raw.tool_call_id;
  if (stable) return `thought-actions::${stable}`;
  return `thought-actions::${index}`;
}

function signature(event = {}) {
  const raw = event.raw || {};
  return `${event.label || ""} ${raw.type || ""} ${raw.event || ""}`;
}
