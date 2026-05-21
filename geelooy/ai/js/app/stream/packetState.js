//B"H

export function isDonePacket(packet) {
  const raw = packet?.data || packet || {};
  const type = String(raw?.type || packet?.type || packet?.event || "");
  const status = String(raw?.status || packet?.status || raw?.state || packet?.state || "");
  const finish = String(raw?.finish_reason || packet?.finish_reason || raw?.message?.status || "");
  return packet === "[DONE]"
    || packet?.dataNoJSON === "[DONE]"
    || packet?.data?.dataNoJSON === "[DONE]"
    || /message_stream_complete|conversation-turn-complete|stream_complete|done/i.test(type)
    || /finished|complete|completed|done|success/i.test(status)
    || /stop|finished|complete|completed|done/i.test(finish);
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
