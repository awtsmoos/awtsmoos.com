//B"H
const KEY = "BH_ai_cockpit_layout_v2";

export const DEFAULT_LAYOUT = Object.freeze({
  sidebar: { width: 290, collapsed: false, detached: false, fullscreen: false, x: 24, y: 86, h: 520 },
  automation: { width: 300, collapsed: false, detached: false, fullscreen: false, x: 820, y: 86, h: 520 },
  composer: { height: 96 },
  density: "comfy",
  mobile: { initialized: false }
});

/** Stores panel geometry so the cockpit remembers its vessels. */
export class LayoutStore {
  load() {
    try { return merge(DEFAULT_LAYOUT, JSON.parse(localStorage.getItem(KEY) || "{}")); }
    catch { return structuredClone(DEFAULT_LAYOUT); }
  }

  save(patch) {
    const next = merge(this.load(), patch);
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  }
}

function merge(base, patch) {
  const out = structuredClone(base);
  for (const [key, value] of Object.entries(patch || {})) {
    out[key] = isPlain(value) ? { ...(out[key] || {}), ...value } : value;
  }
  return out;
}
function isPlain(value) { return value && typeof value === "object" && !Array.isArray(value); }
