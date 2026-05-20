//B"H

/**
 * Chapter 7: Between Two Gates, the Thought Became Visible.
 *
 * A thoughts stream is born as fragments: a start gate, many sparks, and an
 * end gate. The Awtsmoos gathers those sparks into one readable vessel instead
 * of scattering them through the chat like ash across a glass floor.
 *
 * @param {{kind?:string,label?:string,text?:string,raw?:object}[]} events Ordered trace events.
 * @returns {Array} Events with thought start/end ranges folded into one group.
 */
export function groupReasoningEvents(events = []) {
  const output = [];
  let active = null;
  for (const event of events) {
    if (isReasoningStart(event)) {
      if (active) output.push(active);
      active = thoughtVessel(event);
      continue;
    }
    if (isReasoningEnd(event)) {
      if (active) {
        active.raw.events.push(event);
        output.push(active);
        active = null;
      }
      continue;
    }
    if (active && canBelongToThought(event)) {
      appendThought(active, event);
      continue;
    }
    output.push(event);
  }
  if (active) output.push(active);
  return output;
}

function thoughtVessel(event) {
  return { kind: "thinking", label: "Thought trace", text: "", raw: { grouped: true, events: [event] } };
}

function appendThought(active, event) {
  active.text = [active.text, event.text].filter(Boolean).join("\n");
  active.raw.events.push(event);
}

function isReasoningStart(event = {}) {
  return gateMatches(event, /(reasoning|thinking|thoughts?)[_.:-]?(started|start|begin|beginning)|start[_.:-]?(reasoning|thinking|thoughts?)/i);
}

function isReasoningEnd(event = {}) {
  return gateMatches(event, /(reasoning|thinking|thoughts?)[_.:-]?(ended|end|complete|completed|stop|stopped)|end[_.:-]?(reasoning|thinking|thoughts?)/i);
}

function gateMatches(event, regex) {
  const raw = event.raw || {};
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const content = msg.content || raw.content || {};
  return regex.test([event.label, event.kind, raw.type, raw.event, content.content_type, content.status, content.event, content.type].filter(Boolean).join(" "));
}

function canBelongToThought(event = {}) {
  return ["thinking", "hidden", "raw", "awtsmoos_tool", "agent_tool", "tool_call", "tool_result"].includes(event.kind) || Boolean(event.text);
}
