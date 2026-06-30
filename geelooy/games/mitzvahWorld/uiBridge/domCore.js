// B"H
/** @file domCore.js @description Pointer-safe panel primitives for bridge renderers. */
const COLLAPSED = new Set(["uiQuestTracker", "uiQuestMarkers", "uiLivingWorldFeed", "uiLivingWorldSocial", "uiLivingWorldEconomy", "uiMiniMap", "uiQuestProgress", "uiNameplates", "uiCastBar"]);
export const esc = value => String(value ?? "").replace(/[&<>'"]/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[ch]));
export function uiState() { globalThis.__MITZVAH_UI_STATE__ ||= {}; return globalThis.__MITZVAH_UI_STATE__; }
export function closePanel(id) { document.getElementById(id)?.remove(); uiState().closed ||= {}; uiState().closed[id] = Date.now(); }
export function togglePanel(id) { const el = document.getElementById(id); if (!el) return; const collapsed = el.classList.toggle("mitzvahCollapsed"); el.hidden = collapsed; uiState().expanded ||= {}; uiState().expanded[id] = !collapsed; }
export function clearCenter() { document.getElementById("mitzvahCenter")?.replaceChildren(); }
export function controls(id) { return `<div class="mitzvahPanelControls"><button class="mitzvahMini" type="button" onclick="window.__MITZVAH_TOGGLE_PANEL__?.('${esc(id)}')">-</button><button class="mitzvahMini" type="button" aria-label="Close" onclick="window.__MITZVAH_CLOSE_PANEL__?.('${esc(id)}')">x</button></div>`; }
export function mount(parentId, id, title, body = "", cls = "") {
  const parent = document.getElementById(parentId); if (!parent) return null;
  if (parentId === "mitzvahCenter") clearCenter();
  let el = document.getElementById(id);
  if (!el) { el = document.createElement("section"); el.id = id; el.className = `mitzvahPanel ${cls}`.trim(); parent.appendChild(el); }
  const shouldCollapse = COLLAPSED.has(id) && !uiState().expanded?.[id] && parentId !== "mitzvahCenter";
  el.classList.toggle("mitzvahCollapsed", shouldCollapse); el.hidden = shouldCollapse;
  const html = `<div class="mitzvahPanelHead"><div class="mitzvahTitle">${esc(title)}</div>${controls(id)}</div><div class="mitzvahPanelBody">${body}</div>`;
  if (el.__awtsmoosPanelHtml !== html) { el.__awtsmoosPanelHtml = html; el.innerHTML = html; }
  return el;
}
export function rows(items, render) { return (items || []).slice(0, 10).map(render).join("") || `<div class="mitzvahMuted">--</div>`; }
