//B"H

/**
 * Chapter 211: Tools Walked Beside Thought, Not Inside Its Shadow.
 *
 * ChatGPT-style streaming shows thoughts as thoughts and tools as tools. The old
 * envelope folded tool calls/results into a second `thinking` card named
 * "Actions after thought", which made users think tool calls were missing. This
 * renderer now leaves every tool event top-level while still marking textual
 * thinking as a standalone thought card.
 *
 * @param {{kind?:string,label?:string,text?:string,raw?:object}[]} events Ordered render events.
 * @returns {Array<object>} Events with thought text marked, tools unchanged.
 */
export function envelopeThoughtEvents(events = []) {
  return events.flatMap(expandThoughtEvent).map(markEvent);
}

function expandThoughtEvent(event = {}) {
  if (Array.isArray(event.raw?.events) && (event.raw.grouped || event.raw.groupedThoughtEnvelope)) return event.raw.events;
  return [event];
}

function markEvent(event = {}) {
  if (event.kind !== "thinking" || !String(event.text || "").trim()) return event;
  return { ...event, raw: { ...(event.raw || {}), standaloneThoughtText: true } };
}
