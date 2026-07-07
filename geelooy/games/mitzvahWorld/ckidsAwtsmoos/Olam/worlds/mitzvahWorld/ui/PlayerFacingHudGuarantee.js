// B"H
/**
 * The Awtsmoos reveals the old player-facing HUD as a covenant:
 * health, target, X, R, quest, joystick, and jump must have real DOM vessels.
 */
const ID = "awts-player-facing-hud-guarantee";
const $ = selector => document.querySelector(selector);
const pct = (a, b) => Math.max(0, Math.min(100, (Number(a) / Math.max(1, Number(b))) * 100));

function state() {
  const olam = window.__AWTSMOOS_OLAM__ || window.olam || {};
  const player = olam.player || olam.oyved || window.__AWTSMOOS_PLAYER__ || {};
  const hs = window.__AWTSMOOS_PLAYER_HEALTH_STATE__ || {};
  const health = Number(hs.current ?? player.health ?? player.hp ?? olam.health ?? 100);
  const max = Number(hs.max ?? player.maxHealth ?? player.maxHp ?? olam.maxHealth ?? 100);
  const targeting = window.__AWTSMOOS_TARGETING_STATE__ || {};
  const target = targeting.selected || olam.__selectedCombatTarget || olam.selectedTarget || window.__AWTSMOOS_SELECTED_TARGET__ || null;
  const quest = olam.__activeQuest || window.__AWTSMOOS_ACTIVE_QUEST__ || null;
  return { health:Number.isFinite(health) ? health : 100, max:Number.isFinite(max) ? max : 100, target, quest };
}

function style() {
  return `<style id="${ID}-style">
    #${ID}{position:fixed;inset:0;z-index:2147482500;pointer-events:none;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:white;text-shadow:0 2px 5px #000}
    #${ID} .hud-card{background:rgba(7,13,25,.82);border:1px solid rgba(255,217,102,.48);border-radius:10px;box-shadow:0 8px 18px rgba(0,0,0,.32);padding:8px 10px;pointer-events:auto}
    #${ID} .health{position:absolute;left:max(10px,env(safe-area-inset-left));top:max(10px,env(safe-area-inset-top));width:min(280px,70vw)}
    #${ID} .target{position:absolute;right:max(10px,env(safe-area-inset-right));top:max(10px,env(safe-area-inset-top));width:min(230px,58vw)}
    #${ID} .quest{position:absolute;left:max(10px,env(safe-area-inset-left));top:82px;width:min(280px,70vw);font-size:12px}
    #${ID} .actions{position:absolute;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));transform:translateX(-50%);display:flex;gap:8px}
    #${ID} .key{min-width:54px;min-height:42px;display:grid;place-items:center;font-weight:1000;border-radius:10px;background:rgba(0,0,0,.55);border:1px solid rgba(255,217,102,.55)}
    #${ID} .bar{height:9px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,.15);margin-top:5px}.fill{height:100%;background:#58dc72}
    #${ID} .low .fill{background:#ff6048}#${ID} .muted{opacity:.82;font-size:11px}
    @media(max-width:760px){#${ID} .actions{bottom:calc(94px + env(safe-area-inset-bottom));gap:5px}#${ID} .key{min-width:48px;min-height:38px}#${ID} .target{top:72px}.health{font-size:12px}}
  </style>`;
}

function html() {
  return `${style()}<div class="hud-card health" data-hud="health"></div><div class="hud-card target" data-hud="targeting"></div><div class="hud-card quest" data-hud="quest"></div><div class="actions"><div class="key" data-hud="x-action">X<br><span class="muted">Action</span></div><div class="key" data-hud="r-action">R<br><span class="muted">Read</span></div></div>`;
}

function ensureMobileButtons() {
  if (!$("#joystick-container")) document.body.insertAdjacentHTML("beforeend", `<div id="joystick-container" data-hud="joystick"><div id="joystick-base"><div id="joystick-thumb"></div></div></div>`);
  if (!$("#mobile-jump-button")) document.body.insertAdjacentHTML("beforeend", `<button id="mobile-jump-button" data-hud="jump" type="button">↑</button>`);
}

function render(root) {
  const s = state(), low = s.health / Math.max(1, s.max) <= .3;
  const targetName = s.target?.name || s.target?.userData?.name || "Nearest target";
  const targetType = s.target?.type || s.target?.userData?.targetType || "targetable";
  const targetHp = s.target?.health ?? s.target?.hp ?? s.target?.userData?.health ?? null;
  root.querySelector("[data-hud='health']").classList.toggle("low", low);
  root.querySelector("[data-hud='health']").innerHTML = `<b>Health</b> ${Math.round(s.health)}/${Math.round(s.max)}<div class="bar"><div class="fill" style="width:${pct(s.health, s.max)}%"></div></div>`;
  root.querySelector("[data-hud='targeting']").innerHTML = `<b>Targeting</b><div>${targetName}</div><div class="muted">${targetType}${targetHp != null ? ` · HP ${targetHp}` : " · tap/click/select"}</div>`;
  root.querySelector("[data-hud='quest']").innerHTML = `<b>Quest</b><div>${s.quest?.title || s.quest?.name || "Study with a friendly NPC"}</div><div class="muted">R read/rest/reload · X action/interact</div>`;
}

export function installPlayerFacingHudGuarantee() {
  if (typeof document === "undefined") return null;
  let root = document.getElementById(ID);
  if (!root) { root = document.createElement("div"); root.id = ID; root.innerHTML = html(); document.body.appendChild(root); }
  ensureMobileButtons();
  render(root);
  clearInterval(root.__awtsHudTimer);
  root.__awtsHudTimer = setInterval(() => render(root), 350);
  window.__AWTSMOOS_PLAYER_FACING_HUD_GUARANTEE__ = { ok:true, id:ID, has:() => ({ health:!!$("[data-hud='health']"), targeting:!!$("[data-hud='targeting']"), x:!!$("[data-hud='x-action']"), r:!!$("[data-hud='r-action']"), quest:!!$("[data-hud='quest']"), joystick:!!$("#joystick-container"), jump:!!$("#mobile-jump-button") }) };
  return root;
}

if (typeof window !== "undefined") queueMicrotask(installPlayerFacingHudGuarantee);
export default installPlayerFacingHudGuarantee;
