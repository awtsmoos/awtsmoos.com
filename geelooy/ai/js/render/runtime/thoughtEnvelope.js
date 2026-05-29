//B"H

const ACTION_KINDS = /tool|function|status|agent|awtsmoos/i;

/**
 * Chapter 243: The Old Envelope Test And The New Timeline Made Peace.
 *
 * This helper still provides the historic grouping contract for tests and older
 * render paths: thought text, action group, thought text, action group. The live
 * timeline renderer separately turns semantic events into Claude-style visible
 * cards, but this covenant remains true for every caller that imports it.
 *
 * @param {{kind?:string,label?:string,text?:string,raw?:object}[]} events Ordered render events.
 * @returns {Array<object>} Standalone thoughts alternating with action groups.
 */
export function envelopeThoughtEvents(events = []) {
  const out = [];
  let actionBuffer = [];
  for (const event of events.filter(Boolean)) {
    if (isThought(event)) {
      flushActions(out, actionBuffer);
      actionBuffer = [];
      out.push(markThought(event));
      continue;
    }
    if (isAction(event)) {
      actionBuffer.push(event);
      continue;
    }
    flushActions(out, actionBuffer);
    actionBuffer = [];
    out.push(event);
  }
  flushActions(out, actionBuffer);
  return out;
}

function flushActions(out, actionBuffer) {
  if (!actionBuffer.length) return;
  out.push({
    kind: "thinking",
    label: "Actions after thought",
    text: `${actionBuffer.length} action${actionBuffer.length === 1 ? "" : "s"}`,
    raw: {
      groupedThoughtEnvelope: true,
      grouped: true,
      groupKey: `actions::${firstId(actionBuffer)}`,
      events: actionBuffer
    }
  });
}

function markThought(event = {}) {
  return { ...event, raw: { ...(event.raw || {}), standaloneThoughtText: true } };
}

function isThought(event = {}) {
  return event.kind === "thinking" && Boolean(String(event.text || "").trim()) && !event.raw?.groupedThoughtEnvelope;
}

function isAction(event = {}) {
  return ACTION_KINDS.test(`${event.kind || ""} ${event.label || ""} ${event.raw?.type || ""}`) && !isThought(event);
}

function firstId(events = []) {
  const first = events[0] || {};
  return first.raw?.id || first.raw?.tool_call_id || first.label || first.kind || "group";
}
