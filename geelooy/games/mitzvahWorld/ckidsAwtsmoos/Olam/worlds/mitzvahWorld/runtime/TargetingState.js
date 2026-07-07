// B"H
/** Targeting covenant: NPCs, animals, monsters, doors, and props can be selected. */
const KEY = "__AWTSMOOS_TARGETING_STATE__";
let memory = { list:[], selected:null, index:-1, updatedAt:Date.now() };
const finite = v => Number.isFinite(Number(v));
const kind = t => t?.type || t?.kind || t?.userData?.targetType || "interactable";
const name = t => t?.name || t?.id || t?.userData?.name || kind(t);

function publish(detail = {}) {
  memory = { ...memory, ...detail, updatedAt:Date.now() };
  if (typeof window !== "undefined") {
    window[KEY] = memory;
    window.__AWTSMOOS_SELECTED_TARGET__ = memory.selected;
    window.dispatchEvent?.(new CustomEvent("awtsmoos-targeting-change", { detail:memory }));
  }
  return memory;
}

export function registerTargets(targets = []) {
  const list = targets.filter(Boolean).map((t, i) => ({ id:String(t.id || t.name || `target_${i}`), name:name(t), type:kind(t), health:finite(t.health ?? t.hp) ? Number(t.health ?? t.hp) : null, distance:finite(t.distance) ? Number(t.distance) : i + 1, raw:t }));
  const selected = list[0] || null;
  return publish({ list, selected, index:selected ? 0 : -1 });
}

export function selectTarget(idOrIndex = 0) {
  const list = memory.list;
  const index = typeof idOrIndex === "number" ? idOrIndex : list.findIndex(t => t.id === idOrIndex || t.name === idOrIndex || t.type === idOrIndex);
  const safe = list.length ? ((index % list.length) + list.length) % list.length : -1;
  return publish({ selected:safe >= 0 ? list[safe] : null, index:safe });
}

export function cycleTarget(step = 1) { return selectTarget((memory.index < 0 ? 0 : memory.index) + step); }
export function targetSnapshot() { return { ...memory, selectableTypes:[...new Set(memory.list.map(t => t.type))] }; }

if (typeof window !== "undefined") {
  window.__AWTSMOOS_REGISTER_TARGETS__ = registerTargets;
  window.__AWTSMOOS_SELECT_TARGET__ = selectTarget;
  window.__AWTSMOOS_CYCLE_TARGET__ = cycleTarget;
}
