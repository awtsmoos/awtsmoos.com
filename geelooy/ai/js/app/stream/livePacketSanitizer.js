//B"H

/**
 * Chapter 71: The Tail Refused To Swallow The Beginning Twice.
 *
 * A final ChatGPT response may carry `awtsmoos.otherEvents`, the archive of
 * every streamed spark already rendered live. History loading needs that archive;
 * live finalization does not. This purifier removes replay-only event archives
 * while keeping visible assistant text and conversation ids intact.
 *
 * @param {object|string|null} packet Incoming live stream or final packet.
 * @returns {object|string|null} Packet safe for live routing.
 */
export function withoutFinalReplayEvents(packet) {
  if (!packet || typeof packet !== "object" || !packet.awtsmoos?.otherEvents) return packet;
  return { ...packet, awtsmoos: { ...packet.awtsmoos, otherEvents: [] } };
}
