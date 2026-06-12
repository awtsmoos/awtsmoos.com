// B"H
/**
 * @file missionCard.js
 * @description
 * Chapter 655: The mission card carries explicit fallback objectives.
 *
 * The Awtsmoos gives every lava level a mission, hint, tier, and ordered list of
 * objectives. This vessel paints that covenant and keeps a default three-step
 * vow in source: Collect the perutos, Give tzedakah, Return through the mezuzah.
 */
const DEFAULT_OBJECTIVES = Object.freeze([
  { label: "Collect the perutos", icon: "coin", uiOrder: 1 },
  { label: "Give tzedakah", icon: "pushkuh", uiOrder: 2 },
  { label: "Return through the mezuzah gate", icon: "mezuzah", uiOrder: 3 }
]);
const find = name => document.querySelector(`[shaym="${name}"], [data-shaym="${name}"], #${name}, .${name}`);
const safe = value => String(value ?? "").replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[ch]));
const hostFrom = () => find("levelMission") || document.querySelector(".level-mission-card");
const iconFor = icon => ({ coin: "🪙", pushkuh: "🎁", mezuzah: "🚪" }[icon] || "✨");

function objectivesFrom(data = {}) {
  const list = Array.isArray(data.objectives) && data.objectives.length ? data.objectives : DEFAULT_OBJECTIVES;
  return [...list].sort((a, b) => Number(a.uiOrder || 0) - Number(b.uiOrder || 0));
}
function objectiveText(item) {
  const count = Number(item.count || 0);
  const suffix = count > 1 ? ` ×${count}` : "";
  return `${item.icon ? iconFor(item.icon) + " " : ""}${safe(item.label || item.id || item.type)}${suffix}`;
}
function html(data = {}) {
  const objectives = objectivesFrom(data).map(item => `<li>${objectiveText(item)}</li>`).join("");
  const tier = data.difficultyTier ? `<span class="mission-tier">${safe(data.difficultyTier)}</span>` : "";
  return `<div class="mission-kicker">${safe(data.biome || "Level")}${tier}</div><div class="mission-title">${safe(data.title || "Mitzvah World")}</div><div class="mission-text">${safe(data.missionText || data.description || "Complete the mission.")}</div><ol>${objectives}</ol><div class="mission-hint">${safe(data.hintText || "Read the world carefully.")}</div>`;
}
function show(host, data) {
  const card = host.querySelector?.(".mission-card-inner") || host;
  card.innerHTML = html(data);
  host.style.display = "block";
  host.dataset.theme = data.theme || "";
  host.classList.remove("mission-card-soft");
  clearTimeout(host.__awtsmoosMissionHide);
  host.__awtsmoosMissionHide = setTimeout(() => host.classList.add("mission-card-soft"), 4200);
}

export default {
  shaym: "levelMission",
  id: "levelMission",
  className: "level-mission-card",
  style: { position: "fixed", top: "calc(96px + env(safe-area-inset-top))", left: "10px", zIndex: 22990, width: "min(330px, calc(100vw - 74px))", display: "none", pointerEvents: "none", color: "#fff4cf", fontFamily: "Arial, sans-serif" },
  on: {
    awtsmoosRevealed() { const host = hostFrom(); if (host && !host.querySelector?.(".mission-title")) host.style.display = "none"; },
    levelMission(e) { const host = hostFrom(); if (host) show(host, e?.detail || {}); },
    gameHUD(e) { const data = e?.detail?.levelMission; const host = hostFrom(); if (data && host) show(host, data); }
  },
  children: [
    { className: "mission-card-inner", style: { padding: "11px 13px", borderRadius: "18px", background: "linear-gradient(180deg,rgba(42,27,12,.84),rgba(13,9,5,.76))", border: "1px solid rgba(255,218,122,.36)", boxShadow: "0 8px 22px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.12)", backdropFilter: "blur(6px)" } },
    { tag: "style", innerHTML: `.level-mission-card{width:min(278px,calc(100vw - 32px))!important}.level-mission-card .mission-card-inner{padding:9px 11px!important;border-radius:13px!important}.level-mission-card .mission-kicker{font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:#ffd978;font-weight:900}.level-mission-card .mission-tier{margin-left:7px;color:#7dfcff}.level-mission-card .mission-title{font-size:15px;font-weight:900;margin-top:2px;color:#fff8d8}.level-mission-card .mission-text{display:none}.level-mission-card ol{margin:5px 0 0 17px;padding:0;font-size:11px;line-height:1.25}.level-mission-card li{margin:1px 0}.level-mission-card .mission-hint{margin-top:5px;font-size:10px;color:#9effd0}.mission-card-soft{opacity:.68;transition:opacity .6s}@media(max-width:760px){.level-mission-card{top:calc(72px + env(safe-area-inset-top))!important;left:8px!important;width:min(260px,calc(100vw - 16px))!important}}` }
  ]
};
