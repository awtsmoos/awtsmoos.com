//B"H

/**
 * Chapter 44: The Half-Spoken Action Found One Vessel.
 *
 * A commentary tool call may arrive as broken JSON before the closing brace is
 * born. The Awtsmoos lets those fragments stream inside one living action by
 * keying in-progress calls to their recipient and turn/request lineage instead
 * of to every changing text shard.
 *
 * @param {object} event Normalized render event.
 * @returns {string} Stable key for a streaming tool/action, or empty string.
 */
export function streamingToolKey(event = {}) {
  if (!/tool|awtsmoos/i.test(event.kind || "")) return "";
  const raw = event.raw || event;
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const recipient = msg.recipient || raw.recipient || "";
  const channel = msg.channel || raw.channel || "";
  if (channel !== "commentary" || !recipient || recipient === "all") return "";
  const meta = msg.metadata || raw.metadata || {};
  return ["streaming-tool", recipient, meta.turn_exchange_id || meta.request_id || msg.parent_id || raw.conversation_id || "live"].join("::");
}
