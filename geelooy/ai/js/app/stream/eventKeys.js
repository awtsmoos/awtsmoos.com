//B"H
import { compact } from "./packetState.js";

export function eventRecordKey(event = {}) {
  const raw = event.raw || event;
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const stable = msg.id || raw.id || raw.message_id || raw.type || raw.event || event.label;
  return [event.kind || "event", event.label || "", stable || compact(event.text || "").slice(0, 120)].join("::");
}
