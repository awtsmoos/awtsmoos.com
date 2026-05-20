//B"H

export const EVENT_TYPES = ["thinking", "status", "awtsmoos_tool", "agent_tool", "tool_call", "tool_result", "oauth", "raw", "hidden", "code"];
const KEY = "awtsmoosEventVisibility:v2";

export function loadEventVisibility() {
  try { return { ...defaults(), ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
  catch { return defaults(); }
}

export function saveEventVisibility(settings = {}) {
  const next = { ...defaults(), ...settings };
  localStorage.setItem(KEY, JSON.stringify(next));
  applyEventVisibility(next);
  return next;
}

export function applyEventVisibility(settings = loadEventVisibility()) {
  const root = document.documentElement;
  for (const type of EVENT_TYPES) root.toggleAttribute(`data-hide-${type}`, settings[type] === false);
}

export function defaults() {
  return {
    thinking: true,
    oauth: true,
    awtsmoos_tool: true,
    agent_tool: true,
    tool_call: true,
    tool_result: true,
    status: false,
    raw: false,
    hidden: false,
    code: false
  };
}
