//B"H

export function isDonePacket(packet) {
  return packet === "[DONE]"
    || packet?.dataNoJSON === "[DONE]"
    || packet?.data?.dataNoJSON === "[DONE]"
    || /message_stream_complete|conversation-turn-complete/i.test(String(packet?.type || packet?.event || packet?.data?.type || ""));
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
