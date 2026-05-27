//B"H

/**
 * Chapter 96: The False Ending Was Stripped Of Its Crown.
 *
 * ChatGPT emits many status stones near the end of a turn: markers, resume
 * tokens, reasoning state, and sometimes transport-level completion notices.
 * Those may arrive before the visible answer has fully descended into the page.
 * Therefore only literal `[DONE]` is treated as a hard stream terminator here.
 * Higher-level callers may still call StreamRouter.finish() when their own
 * transport has truly ended.
 */
export function isDonePacket(packet) {
  return packet === "[DONE]"
    || packet?.dataNoJSON === "[DONE]"
    || packet?.data?.dataNoJSON === "[DONE]";
}

export function looksLikeUserEcho(renderer, text) {
  const last = renderer.lastUserText?.() || "";
  if (!last) return false;
  const current = compact(text);
  const previous = compact(last);
  return current === previous || current.includes(previous) || previous.includes(current);
}

export function compact(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}
