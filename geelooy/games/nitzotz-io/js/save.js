// B"H
const KEY = 'nitzotz-worlds-save';

export function loadSave() {
  try { return Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}')); }
  catch { return defaults(); }
}

export function saveGame(save) {
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch {}
}

export function defaults() {
  return { best: 0, completed: [], perf: 'medium', haptics: true, postfx: false, uiScale: 1 };
}

/** B"H: Fewer vessels, more revelation. */
export function objectBudget(perf) {
  return perf === 'low' ? 10 : perf === 'high' ? 22 : 16;
}

export function streamRadius(perf) {
  return perf === 'high' ? 2 : 1;
}
