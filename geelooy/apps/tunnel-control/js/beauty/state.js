// B"H

const KEY = "awt.beauty.state";
const defaults = { mission: false, favorites: ["explorer", "terminal", "docs"], timeline: [] };

/**
 * B"H
 * Chapter 390: The Beauty State Became A Hidden Well.
 */
export function loadBeautyState() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
  catch { return { ...defaults }; }
}

export function saveBeautyState(next) {
  localStorage.setItem(KEY, JSON.stringify({ ...loadBeautyState(), ...next }));
}

export function rememberBeauty(key, value) {
  saveBeautyState({ [key]: value });
}

export function toggleFavorite(key) {
  const state = loadBeautyState();
  const set = new Set(state.favorites || []);
  set.has(key) ? set.delete(key) : set.add(key);
  saveBeautyState({ favorites: [...set] });
  return [...set];
}
