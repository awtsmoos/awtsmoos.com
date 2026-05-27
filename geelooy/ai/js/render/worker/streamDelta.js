//B"H
import { interpretStreamPacket } from "../streamPacket.js";

/**
 * Chapter 89: The Packet Was Reduced To A Spark.
 *
 * The worker sees the full provider packet. The main thread should not. This
 * reducer emits only the text delta or a compact event capsule, so the DOM code
 * receives a feather rather than a mountain of nested JSON.
 *
 * @param {Array<object>} packets Parsed SSE packets.
 * @returns {Array<object>} Compact render deltas.
 */
export function packetsToDeltas(packets = []) {
  return packets.map(packetToDelta).filter(Boolean);
}

function packetToDelta(packet) {
  const live = interpretStreamPacket(packet);
  if (live.text) return { kind: "text", text: live.text };
  if (live.event) return { kind: "event", event: live.event };
  if (isDone(packet)) return { kind: "done" };
  return null;
}

function isDone(packet = {}) {
  const raw = packet?.data || packet || {};
  const type = String(raw.type || packet.type || packet.event || "");
  const status = String(raw.status || packet.status || raw.state || packet.state || "");
  return packet === "[DONE]" || packet.dataNoJSON === "[DONE]" || /complete|done|finished/i.test(`${type} ${status}`);
}
