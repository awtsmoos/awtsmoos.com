// B"H
/**
 * @file unitFrames.js
 * @description Chapter 712: the player and chosen opponent receive visible life vessels.
 */
const clamp = value => Math.max(0, Math.min(1, Number(value) || 0));
const find = selector => document.querySelector(selector);

/** @param {HTMLElement} frame Unit frame. @param {object} data Frame data. */
function paint(frame, data = {}) {
  if (!frame) return;
  const hp = Number(data.hp || 0), maxHp = Math.max(1, Number(data.maxHp || 1));
  frame.querySelector(".unit-name").textContent = data.name || "Unknown";
  frame.querySelector(".unit-level").textContent = `Lv ${Number(data.level || 1)}`;
  frame.querySelector(".unit-hp-fill").style.transform = `scaleX(${clamp(hp / maxHp)})`;
  frame.querySelector(".unit-hp-text").textContent = `${Math.ceil(hp)} / ${Math.ceil(maxHp)}`;
  const portrait = frame.querySelector(".unit-portrait");
  portrait.textContent = data.portrait || String(data.species || "CHAI").slice(0, 4).toUpperCase();
  if (data.color) portrait.style.setProperty("--portrait-color", `#${Number(data.color).toString(16).padStart(6, "0")}`);
  const koach = frame.querySelector(".unit-koach-fill");
  if (koach) koach.style.transform = `scaleX(${clamp(Number(data.koach || 0) / Math.max(1, Number(data.maxKoach || 1)))})`;
}

function frameChildren(portrait, name) { return [
  { className: "unit-portrait", textContent: portrait },
  { className: "unit-readout", children: [
    { className: "unit-heading", children: [{ className: "unit-name", textContent: name }, { className: "unit-level", textContent: "Lv 1" }] },
    { className: "unit-hp", children: [{ className: "unit-hp-fill" }, { className: "unit-hp-text", textContent: "100 / 100" }] },
    { className: "unit-koach", children: [{ className: "unit-koach-fill" }] }
  ] }
]; }

const css = `.combat-unit-frames{position:fixed;left:12px;top:12px;z-index:24020;display:flex;gap:12px;pointer-events:none;font-family:Arial,sans-serif}.unit-frame{width:250px;height:74px;display:flex;align-items:center;gap:9px;padding:7px 10px 7px 7px;border:1px solid rgba(239,196,83,.72);border-radius:14px;background:linear-gradient(145deg,rgba(19,21,18,.94),rgba(4,6,5,.88));box-shadow:0 7px 20px rgba(0,0,0,.46),inset 0 1px rgba(255,255,255,.1);backdrop-filter:blur(7px)}.unit-frame.target-frame{border-color:rgba(255,112,78,.8)}.unit-frame.is-hidden{display:none}.unit-portrait{--portrait-color:#2d6b84;flex:0 0 56px;height:56px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 38% 28%,color-mix(in srgb,var(--portrait-color),white 26%),var(--portrait-color) 60%,#0c1110);border:2px solid #f2cf6e;color:#fff6cf;font-size:11px;font-weight:900;letter-spacing:.06em;text-shadow:0 2px 3px #000}.unit-readout{flex:1;min-width:0}.unit-heading{display:flex;justify-content:space-between;gap:5px;margin-bottom:5px;color:#fff0bd;font-weight:900}.unit-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.unit-level{font-size:10px;color:#d4bd7b}.unit-hp,.unit-koach{position:relative;overflow:hidden;background:#160806;border:1px solid rgba(255,255,255,.16);border-radius:999px}.unit-hp{height:19px}.unit-koach{height:7px;margin-top:4px;background:#071223}.unit-hp-fill,.unit-koach-fill{position:absolute;inset:0;transform-origin:left center;transition:transform .12s linear}.unit-hp-fill{background:linear-gradient(90deg,#7b1717,#d13b31 65%,#ff755e)}.unit-koach-fill{background:linear-gradient(90deg,#1d5bb7,#57bfff)}.unit-hp-text{position:absolute;inset:0;display:grid;place-items:center;color:white;font-size:10px;font-weight:900;text-shadow:0 1px 2px #000}@media(max-width:720px){.combat-unit-frames{left:7px;right:7px;top:7px;gap:6px}.unit-frame{width:calc(50vw - 10px);height:58px;padding:5px;gap:5px}.unit-portrait{flex-basis:43px;height:43px;font-size:9px}.unit-name{font-size:10px}.unit-level{display:none}.unit-hp{height:16px}.unit-koach{height:5px}}`;

export default {
  shaym: "combatUnitFrames", className: "combat-unit-frames", children: [
    { className: "unit-frame player-frame", children: frameChildren("CHAI", "Chossid") },
    { className: "unit-frame target-frame is-hidden", children: frameChildren("TARGET", "No target") },
    { tag: "style", innerHTML: css }
  ],
  on: {
    combatUnitFrames(event) { const data = event?.detail || {}; paint(find(".player-frame"), { ...data.player, portrait: "CHAI" }); const target = find(".target-frame"); target?.classList.toggle("is-hidden", !data.target); if (data.target) paint(target, data.target); },
    gameHUD(event) { const stats = event?.detail?.updateStats; if (stats) paint(find(".player-frame"), { ...stats, name: "Chossid", portrait: "CHAI" }); }
  }
};
