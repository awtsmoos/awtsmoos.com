//B"H

/**
 * Chapter 210: The Raw Provider River Was Hidden But Still Fed The Answer.
 *
 * Raw OpenAI-compatible SSE packets are transport plumbing. They may contain
 * fragments of answer text, thinking, and tool deltas, but the user should not
 * see a wall of PROVIDER STREAM cards. Only the interpreted vessels remain:
 * thinking, tools, results, status, and final answer text.
 *
 * @param {{kind?:string}[]} events Raw event capsules.
 * @returns {{kind?:string}[]} Events whose kind is currently visible.
 */
export function visibleEvents(events = []) {
  return events.filter(isEventVisible);
}

export function isEventVisible(event = {}) {
  const kind = event.kind || "raw";
  if (kind === "provider_stream") return false;
  return !document.documentElement.hasAttribute(`data-hide-${kind}`);
}
