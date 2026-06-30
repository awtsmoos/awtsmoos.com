// B"H
const KEY = 'nitzotz-worlds-save';

/** Load the tiny local vessel of player preferences and best score. */
export function loadSave() {
  try { return { ...defaults(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return defaults(); }
}

/** Preserve the run memory without ever blocking play. */
export function saveGame(save) {
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch {}
}

/** Default mode is Extreme, because the user asked for the storm. */
export function defaults() {
  return { best: 0, completed: [], perf: 'high', haptics: true, postfx: true, uiScale: 1 };
}

/** Translate internal perf keys into human button labels. */
export function perfLabel(perf) {
  return ({ low: 'Smooth', medium: 'Balanced', high: 'Extreme' })[perf] || 'Balanced';
}

/** Object density is the first difficulty dial and the first performance guard. */
export function objectBudget(perf) {
  if (perf === 'low') return 11;
  if (perf === 'high') return 26;
  return 19;
}

/** Extreme mode streams a wider ring; other modes stay easier to read. */
export function streamRadius(perf) {
  return perf === 'high' ? 2 : 1;
}

/** Difficulty pressure tightens the clock and raises punishment. */
export function pressureFor(perf) {
  return perf === 'high' ? 1.28 : perf === 'low' ? 0.82 : 1;
}
