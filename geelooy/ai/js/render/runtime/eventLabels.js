//B"H

export const EVENT_LABELS = Object.freeze({
  thinking: "Thinking",
  analysis: "Analysis",
  commentary: "Commentary",
  tool_call: "Tool call",
  tool_result: "Tool result",
  function_call: "Function call",
  function_result: "Function result",
  code: "Code",
  status: "Status",
  oauth: "OAuth",
  hidden: "Hidden",
  raw: "Raw"
});

export function eventKind(event = {}) {
  return event.kind || event.raw?.message?.channel || event.raw?.message?.content?.content_type || "raw";
}

export function labelKind(kind = "raw") {
  return EVENT_LABELS[kind] || titleize(kind);
}

export function eventTitle(event = {}) {
  const kind = eventKind(event);
  return `${labelKind(kind)}${event.label ? ` · ${event.label}` : ""}`;
}

function titleize(kind) {
  return String(kind || "Raw").replace(/[-_]/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
}
