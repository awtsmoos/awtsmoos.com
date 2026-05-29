//B"H

export function recordWeight(record = {}) {
  if (record.text) return Math.max(1, Math.min(5, Math.ceil(String(record.text).length / 1200)));
  const kinds = new Set((record.events || []).map(event => event.kind));
  if (kinds.has("thinking") || kinds.has("hidden")) return 0.75;
  if (kinds.has("tool_call") || kinds.has("tool_result")) return 0.25;
  if (kinds.has("provider_stream") || kinds.has("status") || kinds.has("oauth") || kinds.has("raw")) return 0.2;
  return 0.5;
}

export function recordKinds(record = {}) {
  return [...new Set((record.events || []).map(event => event.kind).filter(Boolean))];
}

export function primaryRecordKind(record = {}) {
  if (record.text) return record.role || "message";
  return recordKinds(record)[0] || "event";
}
