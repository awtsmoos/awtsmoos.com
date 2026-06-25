// B"H
/** @file index.js @description UI bridge with close/collapse covenant, NPC gossip, quests, loot, and boot gate. */
let bootStarted = false;
const SEAL = "ui-dom-idempotent-markers-20260624-bh2";
const esc = v => String(v ?? "").replace(/[&<>'"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[c]));
const trace = () => window.__AWTSMOOS_BOOT_TRACE__ === true;

function safeClone(v, d = 0) {
  if (d > 3) return "[MaxDepth]";
  if (v == null || ["string", "number", "boolean"].includes(typeof v)) return v;
  if (typeof v === "function") return `[Function ${v.name || "anonymous"}]`;
  if (v instanceof Error) return { name:v.name, message:v.message, stack:String(v.stack || "").slice(0, 2000) };
  if (Array.isArray(v)) return v.slice(0, 24).map(x => safeClone(x, d + 1));
  if (typeof v === "object") { const o = {}; for (const k of Object.keys(v).slice(0, 40)) { try { o[k] = safeClone(v[k], d + 1); } catch { o[k] = "[Unreadable]"; } } return o; }
  return String(v).slice(0, 500);
}

function closePanel(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
  window.__MITZVAH_UI_STATE__ ||= {};
  window.__MITZVAH_UI_STATE__.closed ||= {};
  window.__MITZVAH_UI_STATE__.closed[id] = Date.now();
}

function togglePanel(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("mitzvahCollapsed");
}

function controls(id) {
  return `<div class="mitzvahPanelControls"><button class="mitzvahMini" type="button" onclick="window.__MITZVAH_TOGGLE_PANEL__?.('${esc(id)}')">–</button><button class="mitzvahMini" type="button" aria-label="Close" onclick="window.__MITZVAH_CLOSE_PANEL__?.('${esc(id)}')">×</button></div>`;
}

function mount(parentId, id, title, body = "", cls = "") {
  const parent = document.getElementById(parentId); if (!parent) return null;
  if (parentId === "mitzvahCenter") [...parent.children].forEach(ch => { if (ch.id !== id) ch.remove(); });
  let el = document.getElementById(id);
  if (!el) { el = document.createElement("section"); el.id = id; el.className = `mitzvahPanel ${cls}`.trim(); parent.appendChild(el); }
  const html = `<div class="mitzvahPanelHead"><div class="mitzvahTitle">${esc(title)}</div>${controls(id)}</div><div class="mitzvahPanelBody">${body}</div>`;
  if (el.__awtsmoosPanelHtml === html) return el;
  el.__awtsmoosPanelHtml = html;
  el.innerHTML = html;
  return el;
}

function clearCenterUnless(id) { const c = document.getElementById("mitzvahCenter"); if (c) [...c.children].forEach(el => { if (el.id !== id) el.remove(); }); }
function rows(xs, fn) { return (xs || []).slice(0, 10).map(fn).join("") || `<div class="mitzvahMuted">—</div>`; }
function olamOf(scope = window) { return scope.__AWTSMOOS_OLAM__ || scope.olam || scope.ikar?.olam || scope.mana?.activeOlam || scope.mana?.olam || scope.__MITZVAH_FALLBACK_OLAM__ || null; }
function money(r) { return Number(r?.perutah || r?.money || r?.coins || 0); }
function markerSymbol(marker) { return String(marker || "").includes("question") ? "?" : "!"; }
function markerGray(marker) { return String(marker || "").startsWith("gray"); }
function npcPositionFromOlam(npcId) { const olam = olamOf(window), list = olam?.npcs || olam?.nivrayim || olam?.interactables || []; const n = list.find(x => [x.id, x.name, x.mesh?.name, x.mesh?.userData?.npcId].includes(npcId)); return n?.mesh?.position || n?.position || null; }
function projectWorldPosition(pos) { const camera = window.__AWTSMOOS_CAMERA__ || window.camera || window.mana?.camera || window.ikar?.camera; const THREE = window.THREE; if (!pos || !camera || !THREE?.Vector3) return null; const v = new THREE.Vector3(pos.x || 0, (pos.y || 0) + 3, pos.z || 0).project(camera); return { x:(v.x * .5 + .5) * innerWidth, y:(-v.y * .5 + .5) * innerHeight, projected:true }; }
function fallbackMarkerPosition(i, count) { const n = Math.max(1, count), step = Math.min(92, Math.max(46, innerWidth / (n + 1))); return { x:Math.min(innerWidth - 44, 44 + i * step), y:128 + (i % 3) * 44, projected:false }; }

function worldMarkersHidden() { return document.documentElement.classList.contains("awtsmoos-hide-world-markers"); }
function markerPayloadKey(marks) { return JSON.stringify(marks.map(m => [m.npcId, m.missionId, m.marker, m.npcName, m.title, m.x, m.y])); }
function clearMarkerRoot(root) { if (!root || root.__awtsmoosMarkerKey === "empty") return; root.replaceChildren(); root.__awtsmoosMarkerKey = "empty"; root.__awtsmoosMarkerSummary = { count:0, projected:0, hidden:true }; }
function renderWorldQuestMarkers(p = {}) {
  const root = document.getElementById("mitzvahWorldMarkers"); if (!root) return null;
  const marks = (p.markers || []).slice(0, 14);
  if (worldMarkersHidden() || !marks.length) { clearMarkerRoot(root); return root.__awtsmoosMarkerSummary || { count:0, projected:0, hidden:true }; }
  const positioned = marks.map((m, i) => ({ mark:m, pos:projectWorldPosition(npcPositionFromOlam(m.npcId)) || fallbackMarkerPosition(i, marks.length) }));
  const key = markerPayloadKey(positioned.map(({ mark, pos }) => ({ ...mark, x:Math.round(pos.x), y:Math.round(pos.y) })));
  if (root.__awtsmoosMarkerKey === key) return root.__awtsmoosMarkerSummary || { count:marks.length, projected:0, cached:true };
  const frag = document.createDocumentFragment();
  let projected = 0;
  positioned.forEach(({ mark:m, pos }) => {
    if (pos.projected) projected += 1;
    const el = document.createElement("button");
    el.type = "button";
    el.className = `mitzvahMarker ${markerGray(m.marker) ? "gray" : ""}`.trim();
    el.style.cssText = `left:${Math.round(pos.x)}px;top:${Math.round(pos.y)}px`;
    el.title = `${m.npcName}: ${m.title}`;
    el.dataset.npc = m.npcId;
    el.dataset.mission = m.missionId;
    el.dataset.marker = m.marker;
    el.textContent = markerSymbol(m.marker);
    el.onclick = () => window.__MITZVAH_NPC_INTERACTION__?.open?.(m.npcId);
    frag.appendChild(el);
  });
  root.replaceChildren(frag);
  root.__awtsmoosMarkerKey = key;
  root.__awtsmoosMarkerSummary = { count:marks.length, projected };
  return root.__awtsmoosMarkerSummary;
}

function renderQuestTracker(p = {}) { return mount("mitzvahTopRight", "uiQuestTracker", "Shlichus Tracker", rows(p.active, q => `<div class="mitzvahQuestLine ${q.complete ? "mitzvahDone" : ""}"><b>${esc(q.line || q.title)}</b>${rows(q.objectives, o => `<br><small class="${o.complete ? "mitzvahDone" : ""}">${esc(o.line || o.text)}</small>`)}${q.returnTo ? `<br><small>Return to ${esc(q.returnTo)}</small>` : ""}</div>`)); }
function renderQuestMarkers(p = {}) { renderWorldQuestMarkers(p); return mount("mitzvahTopRight", "uiQuestMarkers", "Quest Markers", rows(p.markers, m => `<div>${markerSymbol(m.marker)} ${esc(m.npcName)} <small>${esc(m.title)}</small></div>`)); }
function questButtons(p) { const id = esc(p.id || p.missionId), giver = esc(p.npcId || "rebbe"); const a = p.buttons?.accept ? `<button class="mitzvahChoice" onclick="window.__MITZVAH_CHOOSE_NPC__?.('${giver}','accept:${id}')">Accept</button>` : ""; const d = p.buttons?.decline ? `<button class="mitzvahChoice" onclick="window.__MITZVAH_CHOOSE_NPC__?.('${giver}','decline:${id}'); window.__MITZVAH_CLOSE_PANEL__?.('uiQuestPanel')">Decline</button>` : ""; const c = p.buttons?.complete || p.turnInReady ? `<button class="mitzvahChoice" onclick="window.__MITZVAH_CHOOSE_NPC__?.('${giver}','turnin:${id}')">Complete Shlichus</button>` : ""; return `${a}${c}${d}`; }
function rewardRows(rewards = {}) { const xp = rewards.xp ? `<div class="mitzvahReward">XP: ${esc(rewards.xp)}</div>` : ""; const items = rows(rewards.items, id => `<div class="mitzvahReward">Reward: ${esc(id)}</div>`); const cash = money(rewards) ? `<div class="mitzvahReward">Perutah: ${money(rewards)}</div>` : ""; return `${xp}${items}${cash}` || `<div class="mitzvahMuted">No listed reward</div>`; }
function renderQuestPanel(p = {}, mode = "quest") { const title = p.title || p.missionId || "Shlichus"; const state = p.state || (p.ok ? "accepted" : p.reason || mode); const objectives = rows(p.objectives, o => `<li class="${o.complete ? "mitzvahDone" : ""}">${esc(o.text || o.label || o.line)} ${Number.isFinite(o.current) ? `${o.current}/${o.needed}` : ""}</li>`); return mount("mitzvahCenter", "uiQuestPanel", title, `<small>${esc(p.giverNpc || p.returnTo || "Starter Zone")}${p.levelRange ? ` · Level ${esc(p.levelRange.join("-"))}` : ""} · ${esc(state)}</small><p>${esc(p.story || p.text || "Carry this shlichus into the world.")}</p><ul>${objectives}</ul><div>${rewardRows(p.rewards)}</div>${questButtons(p)}`, "mitzvahQuestPanel"); }
function renderQuestProgress(p = {}) { return mount("mitzvahTopLeft", "uiQuestProgress", "Quest Progress", `<div class="mitzvahQuestLine ${p.complete ? "mitzvahDone" : ""}">${esc(p.objectiveId || "Objective")} ${esc(p.progress || "")}${p.complete ? " complete" : ""}</div>`); }
function renderGossip(p = {}) { if (!p.open) return (closePanel("uiGossip"), null); window.__MITZVAH_ACTIVE_GOSSIP__ = p; const choices = rows(p.choices, c => `<button class="mitzvahChoice" data-npc="${esc(p.npcId)}" data-choice="${esc(c.id)}" onclick="window.__MITZVAH_CHOOSE_NPC__?.(this.dataset.npc,this.dataset.choice)">${esc(c.label || c.kind)}</button>`); return mount("mitzvahCenter", "uiGossip", p.npcName || "NPC", `<p>${esc(p.greeting || "B\"H, how can I help?")}</p>${choices}`); }
function renderLootSparkle(p = {}) { return mount("mitzvahBottomCenter", "uiLootSparkle", "Loot", rows(p.corpses, c => `<button class="mitzvahChoice mitzvahSparkle" onclick="window.__MITZVAH_OPEN_LOOT__?.('${esc(c.corpseId)}')">✦ ${esc(c.name || c.corpseId)} sparkles</button>`)); }
function renderLoot(p = {}) { if (!p.open && !p.looted) return null; const items = rows(p.table?.items, i => `<div class="mitzvahReward">${esc(i.id)} x${i.qty || 1}</div>`); const all = p.corpseId && !p.looted ? `<button class="mitzvahChoice" onclick="window.__MITZVAH_LOOT_ALL__?.('${esc(p.corpseId)}')">Loot All</button>` : `<div class="mitzvahDone">Looted</div>`; return mount("mitzvahCenter", "uiLootWindow", p.creatureName || "Loot", `${items}<div class="mitzvahReward">${p.table?.money || p.perutah || 0} perutah</div>${all}`); }
function renderSpirit(p = {}) { if (!p.open && !p.ghost) return null; return mount("mitzvahCenter", "uiSpiritHealer", "Spirit Healer", rows(p.choices, c => `<div class="mitzvahChoice ${c.enabled ? "" : "mitzvahMuted"}">${esc(c.label)} ${c.enabled ? "" : "(not yet)"}</div>`)); }
function renderMinimap(p = {}) { const bits = [`${(p.markers || p.discovered || []).length} markers`, p.corpse ? "corpse" : "no corpse", p.hearth ? "hearth bound" : "no hearth"]; return mount("mitzvahTopRight", "uiMiniMap", "Minimap", bits.map(esc).join("<br>")); }
function renderNameplates(p = {}) { const plates = Array.isArray(p) ? p : (p.plates || []); return mount("mitzvahTopLeft", "uiNameplates", "Nameplates", rows(plates, x => `<div>${x.rare ? "★ " : ""}${x.elite ? "Elite " : ""}${esc(x.name)} ${x.hp ?? "?"}/${x.maxHp ?? "?"}</div>`)); }
function renderCastBar(p = {}) { if (!p.active) return mount("mitzvahBottomCenter", "uiCastBar", "Cast", "<span class='mitzvahMuted'>—</span>"); const pct = Math.max(0, Math.min(100, Math.floor((p.progress || 0) * 100))); return mount("mitzvahBottomCenter", "uiCastBar", p.spell || "Cast", `<small>${esc(p.caster)} ${p.interruptible ? "interruptible" : "locked"}</small><div class="mitzvahCastTrack"><div class="mitzvahCastFill" style="width:${pct}%"></div></div>`); }
function renderTrainer(p = {}) { return mount("mitzvahTopLeft", "uiTrainer", "Trainer", rows(p.trainers || p.abilities || [], t => `<div><b>${esc(t.name || t.id || t.trainerId)}</b> <small>${esc(t.state || t.status || "trainable")}</small></div>`)); }
function renderVendor(p = {}) { const stock = rows(p.items || p.stock || [], i => `<div>${esc(i.name || i.id)} <small>${esc(i.price || i.cost || "")}</small></div>`); const repair = p.repairCost || p.cost ? `<button class="mitzvahChoice">Repair All · ${esc(p.repairCost || p.cost)}</button>` : ""; return mount("mitzvahTopLeft", "uiVendor", "Vendor", `${stock}${repair}`); }
function renderSimple(title, p = {}) { return mount("mitzvahTopLeft", `ui${title.replace(/\W/g, "")}`, title, `<p>${esc(p.text || p.message || p.status || p.reason || "Ready")}</p>`); }
function renderStarterHud(p = {}) { if (p.questTracker) renderQuestTracker(p.questTracker); if (p.questMarkers) renderQuestMarkers(p.questMarkers); if (p.minimap) renderMinimap(p.minimap); if (p.loot) renderLootSparkle(p.loot); if (p.spiritHealer) renderSpirit(p.spiritHealer); if (p.nameplates) renderNameplates(p.nameplates); if (p.castbar) renderCastBar(p.castbar); if (p.activeNpc) renderGossip(p.activeNpc); return true; }
async function openLoot(corpseId) { try { const mod = await import(`./ckidsAwtsmoos/systems/loot/LootRuntime.js?bh=${SEAL}`); return renderLoot(mod.lootPayload(olamOf(window), corpseId)); } catch (e) { return renderSimple("Loot Error", { text:e.message }); } }
async function lootAll(corpseId) { try { const mod = await import(`./ckidsAwtsmoos/systems/loot/LootRuntime.js?bh=${SEAL}`); const result = mod.lootAll(olamOf(window), corpseId); renderLoot({ open:true, corpseId, looted:result.ok, perutah:result.perutah }); renderLootSparkle(mod.lootSparklePayload(olamOf(window))); return result; } catch (e) { return renderSimple("Loot Error", { text:e.message }); } }

function installSoloWowUiBridge() {
  window.__MITZVAH_UI_STATE__ ||= {}; window.__MITZVAH_CLOSE_PANEL__ = closePanel; window.__MITZVAH_TOGGLE_PANEL__ = togglePanel; window.addEventListener("keydown", e => { if (e.code === "Escape") { clearCenterUnless(""); closePanel("uiGossip"); closePanel("uiQuestPanel"); closePanel("uiLootWindow"); closePanel("uiSpiritHealer"); } });
  const r = { starterZoneHud:renderStarterHud, npcGossip:renderGossip, questAccepted:p => renderQuestPanel(p, "accepted"), questProgress:renderQuestProgress, questTurnedIn:p => renderQuestPanel({ ...p, state:"turned-in", story:"Shlichus complete. The reward has entered your pack." }, "turned-in"), questTracker:renderQuestTracker, questMarkers:renderQuestMarkers, lootSparkle:renderLootSparkle, loot:renderLoot, spiritHealer:renderSpirit, deathState:p => renderSpirit({ open:p.ghost, ghost:p.ghost, choices:[{ label:"Return to corpse", enabled:Boolean(p.corpse) }, { label:"Spirit healer", enabled:p.ghost }] }), minimap:renderMinimap, mapReveal:renderMinimap, castBar:renderCastBar, nameplates:renderNameplates, corpseMarker:p => mount("mitzvahTopRight", "uiCorpse", "Corpse", p.hasCorpse ? `x:${Math.round(p.corpse?.x || 0)} z:${Math.round(p.corpse?.z || 0)}` : "none"), rareAnnouncement:p => mount("mitzvahBottomCenter", "uiRare", "Rare", p.text || p.name || "Rare sighted"), trainerScreen:renderTrainer, vendorScreen:renderVendor, innRest:p => renderSimple("Inn", { text:`Rested XP ${p.rested?.value || p.rested || 0}` }), hearthBind:p => renderSimple("Hearth", { text:p.boundLocation || p.location || "Hearth bound" }), bankScreen:p => renderSimple("Bank", p), mailboxScreen:p => renderSimple("Mailbox", p), worldAnnouncement:p => mount("mitzvahBottomCenter", "uiWorld", p.title || "World", p.text || "Announcement") };
  window.__MITZVAH_UI_BRIDGE__ = { receive(name, payload) { window.__MITZVAH_UI_STATE__[name] = safeClone(payload); r[name]?.(payload || {}); return true; }, state:window.__MITZVAH_UI_STATE__ };
  window.__MITZVAH_CHOOSE_NPC__ = (npcId, choiceId) => window.__MITZVAH_NPC_INTERACTION__?.choose?.(npcId, choiceId);
  window.__MITZVAH_OPEN_LOOT__ = openLoot; window.__MITZVAH_LOOT_ALL__ = lootAll;
  window.addEventListener("message", e => { const d = e.data || {}; if (d.type === "ui event" && d.name) window.__MITZVAH_UI_BRIDGE__.receive(d.name, d.payload); });
}

function renderErrorPanel(details) { let p = document.getElementById("awtsmoosBootErrorPanel"); if (!p) { p = document.createElement("pre"); p.id = "awtsmoosBootErrorPanel"; p.style.cssText = "position:fixed;inset:12px;z-index:999999;padding:16px;overflow:auto;white-space:pre-wrap;background:#190000;color:#ffd7a0;border:2px solid #ff6b2a;font:13px/1.4 monospace;"; document.body.appendChild(p); } p.textContent = `B\"H — Mitzvah World boot error\n\n${JSON.stringify(details, null, 2)}`; }
function describeAwtsmoosError(error, context = {}) { const details = { context:safeClone(context), thrown:safeClone(error), at:new Date().toISOString(), page:location?.href || null }; window.__AWTSMOOS_LAST_ERROR__ = details; window.__AWTSMOOS_LAST_ERROR_JSON__ = JSON.stringify(details, null, 2); window.__AWTSMOOS_ERROR_COUNT__ = Number(window.__AWTSMOOS_ERROR_COUNT__ || 0) + 1; if (trace()) console.error(`B"H - ${context.label || "Runtime error"}`, details); renderErrorPanel(details); return details; }
async function installBrowserHelpers() { try { const smoke = await import(`./ckidsAwtsmoos/testing/CompactLiveSmoke.js?bh=${SEAL}`); smoke.installCompactLiveSmoke?.(window); } catch (e) { window.__MITZVAH_COMPACT_SMOKE_INSTALL_ERROR__ = safeClone(e); } try { const npc = await import(`./ckidsAwtsmoos/systems/npc/NpcInteractionRuntime.js?bh=${SEAL}`); npc.installNpcInteractionControls?.(window, () => olamOf(window)); } catch (e) { window.__MITZVAH_NPC_INSTALL_ERROR__ = safeClone(e); } }
function bootIkarNow() { if (bootStarted || typeof window === "undefined" || !window.document) return; bootStarted = true; window.__AWTSMOOS_BOOT_STARTED__ = { at:new Date().toISOString(), readyState:document.readyState, seal:SEAL }; installSoloWowUiBridge(); installBrowserHelpers(); const url = `./ckidsAwtsmoos/ikar.js?compact=true&bh=${SEAL}`; import(url).then(m => { window.__AWTSMOOS_BOOT_LOADED__ = { at:new Date().toISOString(), keys:Object.keys(m || {}).slice(0, 20), seal:SEAL }; }).catch(e => describeAwtsmoosError(e, { label:"Index [Main]: Failed to load UI starter", phase:"dynamic import", moduleURL:new URL(url, import.meta.url).href })); }
window.addEventListener("error", e => describeAwtsmoosError(e.error || e.message, { label:"Global error", phase:"window.error", moduleURL:e.filename, line:e.lineno, column:e.colno }));
window.addEventListener("unhandledrejection", e => describeAwtsmoosError(e.reason, { label:"Unhandled promise rejection", phase:"window.unhandledrejection" }));
export async function heescheel(ctx) { if (trace()) console.info("B\"H - Index [Worker]: data-driven level hook.", Boolean(ctx)); }
export function ready(ctx) { ctx.postMsg({ type:"game started", payload:true }); }
export function afterBriyah(ctx) { if (trace()) console.info("B\"H - Index [Worker]: afterBriyah() called", Boolean(ctx)); }
if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", bootIkarNow, { once:true }); else bootIkarNow();
