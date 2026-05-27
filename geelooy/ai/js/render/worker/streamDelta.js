//B"H
import { interpretStreamPacket } from "../streamPacket.js";

/**
 * Chapter 89: The Packet Was Reduced To A Spark.
 *
 * The worker sees the full provider packet. The main thread should not. This
 * reducer emits only text deltas, semantic event capsules, and literal stream
 * terminators. Tool lifecycle statuses may say "complete" before the final
 * assistant answer exists; they must remain events, never fake done markers.
 *
 * @param {Array<object>} packets Parsed SSE packets.
 * @returns {Array<object>} Compact render deltas.
 */
export function packetsToDeltas(packets = []) {
  return packets.map(packetToDelta).filter(Boolean);
}

function packetToDelta(packet) {
  if (isLiteralDone(packet)) return { kind: "done" };
  const live = interpretStreamPacket(packet);
  if (live.text) return { kind: "text", text: live.text };
  if (live.event) return { kind: "event", event: live.event };
  return null;
}

function isLiteralDone(packet = {}) {
  return packet === "[DONE]"
    || packet?.dataNoJSON === "[DONE]"
    || packet?.data?.dataNoJSON === "[DONE]";
}
