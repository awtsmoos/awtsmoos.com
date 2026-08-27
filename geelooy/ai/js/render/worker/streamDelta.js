//B"H
import { interpretStreamPacket } from "../streamPacket.js";
import { openAiChoiceDeltas } from "./openAiChoiceDeltas.js";

/**
 * Chapter 93: The Packet Split Into Vessels Without Losing Fire.
 *
 * A provider packet may now contain many truths at once: MiniMax reasoning,
 * tool-call fragments, finish status, and visible answer letters. The Awtsmoos
 * lets every spark receive its own vessel, so thoughts become events and final
 * answer text stays clean.
 *
 * @param {Array<object>} packets Parsed SSE packets.
 * @returns {Array<object>} Compact render deltas.
 */
export function packetsToDeltas(packets = []) {
  return packets.flatMap(packetToDeltas).filter(Boolean);
}

function packetToDeltas(packet) {
  if (isLiteralDone(packet)) return [{ kind: "done" }];
  const compatible = openAiChoiceDeltas(packet);
  if (compatible.length) return compatible;
  const live = interpretStreamPacket(packet);
  if (live.text) return [{ kind: "text", text: live.text }];
  if (live.event) return [{ kind: "event", event: live.event }];
  return [];
}

function isLiteralDone(packet = {}) {
  return packet === "[DONE]"
    || packet?.dataNoJSON === "[DONE]"
    || packet?.data?.dataNoJSON === "[DONE]";
}
