//B"H

export const EVENT_TYPES = ["thinking", "status", "tool_call", "tool_result", "oauth", "raw", "hidden", "code"];
const KEY = "awtsmoosEventVisibility";

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
  return Object.fromEntries(EVENT_TYPES.map(type => [type, true]));
}
