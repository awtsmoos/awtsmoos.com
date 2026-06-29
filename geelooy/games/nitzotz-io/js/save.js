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
  return { best: 0, completed: [], perf: 'high', haptics: true, postfx: true, uiScale: 1 };
}

/** B"H: Density honors the smoke-tested chunk windows exactly. */
export function objectBudget(perf) {
  return perf === 'low' ? 10 : perf === 'high' ? 24 : 20;
}

export function streamRadius(perf) {
  return perf === 'high' ? 2 : 1;
}
