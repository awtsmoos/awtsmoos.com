// B"H
/** Targeting covenant: keyboard, tap, marker, and metadata for every target. */
const KEY = "__AWTSMOOS_TARGETING_STATE__";
const MARKER_ID = "awtsmoos-target-marker";
let memory = { list:[], selected:null, index:-1, updatedAt:Date.now() };
let highlightedRaw = null;
const finite = v => Number.isFinite(Number(v));
const kind = t => t?.type || t?.kind || t?.userData?.targetType || "interactable";
const name = t => t?.name || t?.id || t?.userData?.name || kind(t);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

function targetInfo(target) {
  if (!target) return null;
  return { id:target.id, name:target.name, type:target.type, health:target.health, distance:target.distance };
}
function ensureMarker() {
  if (typeof document === "undefined") return null;
  let marker = document.getElementById(MARKER_ID);
  if (marker) return marker;
  marker = document.createElement("div"); marker.id = MARKER_ID; marker.dataset.hud = "target-marker";
  marker.style.cssText = "position:fixed;left:50%;top:18%;transform:translate(-50%,-50%);z-index:2147482600;pointer-events:none;padding:7px 11px;border-radius:999px;background:rgba(0,0,0,.68);border:1px solid rgba(255,216,77,.75);color:#fff;font:800 12px system-ui;text-shadow:0 2px 5px #000;box-shadow:0 0 18px rgba(255,216,77,.35)";
  document.body.appendChild(marker); return marker;
}
function updateMarker(selected) {
  const marker = ensureMarker(); if (!marker) return;
  if (!selected) { marker.hidden = true; return; }
  marker.hidden = false; marker.dataset.targetId = selected.id; marker.dataset.targetType = selected.type;
  marker.innerHTML = `◉ ${esc(selected.name)} <span style="opacity:.78">${esc(selected.type)}${selected.distance != null ? ` · ${Number(selected.distance).toFixed(1)}m` : ""}${selected.health != null ? ` · HP ${esc(selected.health)}` : ""}</span>`;
}
function restoreHighlight(raw) {
  if (!raw) return;
  try {
    raw.userData ||= {}; raw.userData.awtsmoosTargetHighlighted = false; raw.userData.targetHighlightVisible = false;
    if (raw.material?.emissive && raw.userData.__awtsTargetOldEmissive != null) raw.material.emissive.setHex(raw.userData.__awtsTargetOldEmissive);
    if (raw.scale && raw.userData.__awtsTargetOldScale) raw.scale.copy(raw.userData.__awtsTargetOldScale);
  } catch {}
}
function setHighlighted(target) {
  const raw = target?.raw || target;
  if (highlightedRaw && highlightedRaw !== raw) restoreHighlight(highlightedRaw);
  highlightedRaw = raw || null; if (!raw) return;
  try {
    raw.userData ||= {}; raw.userData.awtsmoosTargetHighlighted = true; raw.userData.targetHighlightVisible = true;
    if (raw.material?.emissive) { raw.userData.__awtsTargetOldEmissive ??= raw.material.emissive.getHex(); raw.material.emissive.setHex(0xffd84d); }
    if (raw.scale && !raw.userData.__awtsTargetOldScale) { raw.userData.__awtsTargetOldScale = raw.scale.clone(); raw.scale.multiplyScalar(1.04); }
  } catch {}
}
function publish(detail = {}) {
  memory = { ...memory, ...detail, updatedAt:Date.now() }; setHighlighted(memory.selected); updateMarker(memory.selected);
  if (typeof window !== "undefined") {
    window[KEY] = memory; window.__AWTSMOOS_SELECTED_TARGET__ = memory.selected; window.__AWTSMOOS_SELECTED_TARGET_INFO__ = targetInfo(memory.selected);
    window.dispatchEvent?.(new CustomEvent("awtsmoos-targeting-change", { detail:memory }));
  }
  return memory;
}
export function registerTargets(targets = []) {
  const list = targets.filter(Boolean).map((t, i) => ({ id:String(t.id || t.name || `target_${i}`), name:name(t), type:kind(t), health:finite(t.health ?? t.hp) ? Number(t.health ?? t.hp) : null, distance:finite(t.distance) ? Number(t.distance) : i + 1, raw:t }));
  return publish({ list, selected:list[0] || null, index:list.length ? 0 : -1 });
}
export function selectTarget(idOrIndex = 0) {
  const list = memory.list, index = typeof idOrIndex === "number" ? idOrIndex : list.findIndex(t => t.id === idOrIndex || t.name === idOrIndex || t.type === idOrIndex);
  const safe = list.length ? ((index % list.length) + list.length) % list.length : -1; return publish({ selected:safe >= 0 ? list[safe] : null, index:safe });
}
export function cycleTarget(step = 1) { return selectTarget((memory.index < 0 ? 0 : memory.index) + step); }
export function cycleAnimalTarget(step = 1) {
  const animals = memory.list.map((target, index) => ({ target, index })).filter(({ target }) => /animal|horse|cow|deer|fox|goat/i.test(`${target.type} ${target.name}`));
  if (!animals.length) return cycleTarget(step);
  const current = animals.findIndex(({ index }) => index === memory.index); const next = animals[((current < 0 ? 0 : current + step) % animals.length + animals.length) % animals.length];
  return selectTarget(next.index);
}
export function targetSnapshot() { return { ...memory, selectedInfo:targetInfo(memory.selected), selectableTypes:[...new Set(memory.list.map(t => t.type))] }; }

if (typeof window !== "undefined") {
  window.__AWTSMOOS_REGISTER_TARGETS__ = registerTargets; window.__AWTSMOOS_SELECT_TARGET__ = selectTarget; window.__AWTSMOOS_CYCLE_TARGET__ = cycleTarget; window.__AWTSMOOS_CYCLE_ANIMAL_TARGET__ = cycleAnimalTarget;
  window.addEventListener("keydown", event => { if (event.defaultPrevented) return; if (event.code === "KeyT" || event.code === "Tab") { event.preventDefault(); cycleTarget(event.shiftKey ? -1 : 1); } if (event.code === "KeyY") { event.preventDefault(); cycleAnimalTarget(event.shiftKey ? -1 : 1); } });
  window.addEventListener("pointerup", event => { const tag = String(event.target?.tagName || "").toLowerCase(); const id = event.target?.dataset?.targetId; if (id) selectTarget(id); else if (tag === "canvas") cycleAnimalTarget(1); }, { passive:true });
}
