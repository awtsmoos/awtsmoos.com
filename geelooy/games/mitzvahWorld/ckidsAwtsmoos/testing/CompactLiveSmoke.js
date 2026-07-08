// B"H
/** @file CompactLiveSmoke.js @description Tiny browser-side smoke hooks, player-facing starter HUD probe, and WoW-starting-zone brainstorm without console floods. */
import { installStarterZoneHudBridge } from "../ui/StarterZoneHudRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const WOW_GAPS = Object.freeze([
  "class trainer loop with rank upgrades",
  "vendor buyback and repair durability",
  "innkeeper hearth bind and rested XP",
  "graveyard spirit healer and corpse run",
  "patrolling guards with social aggro",
  "rare spawn announcements and silver-dragon frame",
  "elite warning tags and group quest hints",
  "flight master / travel route discover",
  "profession trainer tutorials for farming/leather/tefillin craft",
  "minimap tracking toggles for herbs, vendors, quests",
  "loot roll / need-greed foundation for parties",
  "enemy nameplates with cast bars and interrupt windows",
  "ambient critter density that never blocks paths",
  "rested campfire/inn social hub",
  "auction-board style market stall",
  "bank bags and reagent tab",
  "mail delivery delay and cash-on-delivery",
  "quest gossip choices with accept/decline",
  "breadcrumb quests to next sub-zone",
  "danger leash visualization and evade reset logs"
]);
function dispatchKey(code) { document.dispatchEvent(new KeyboardEvent("keydown", { code, bubbles:true })); document.dispatchEvent(new KeyboardEvent("keyup", { code, bubbles:true })); }
function count(sel) { return document.querySelectorAll(sel).length; }
function olamOf(scope) { return scope.__AWTSMOOS_OLAM__ || scope.olam || scope.ikar || scope.__MITZVAH_OLAM__ || null; }
function compactStats() { const stats = window.__AWTSMOOS_LIVING_REGION_STATS__ || {}; return { layers:stats.layers || 0, meshes:stats.meshes || 0, instancedMeshes:stats.instancedMeshes || 0, instances:stats.instances || 0, grassTufts:stats.grassTufts || 0, houseSlabs:stats.houseSlabs || 0, finalColliderBatch:stats.finalColliderBatch || null }; }
function playerFacingSmoke(scope) { try { const hud = installStarterZoneHudBridge(scope, () => olamOf(scope)); const snap = hud.snapshot(); return { ok:Boolean(snap.questTracker && snap.questMarkers && snap.minimap && snap.loot && snap.spiritHealer), questTracker:snap.questTracker?.count || 0, questMarkers:snap.questMarkers?.count || 0, minimapMarkers:snap.minimap?.markers?.length || 0, lootCorpses:snap.loot?.corpses?.length || 0, spiritOpen:Boolean(snap.spiritHealer?.open), activeNpc:Boolean(snap.activeNpc), nameplates:snap.nameplates?.length || 0 }; } catch (e) { return { ok:false, reason:e?.message || String(e) }; } }
export function installCompactLiveSmoke(scope = window) {
  if (scope.__MITZVAH_COMPACT_SMOKE__) return scope.__MITZVAH_COMPACT_SMOKE__;
  const api = {
    version:"compact-smoke-20260615-player-facing-bh2",
    brainstorm:() => WOW_GAPS.slice(0, 20),
    playerFacing:() => playerFacingSmoke(scope),
    snapshot:() => ({ title:document.title, readyState:document.readyState, canvas:count("canvas"), bodyChars:(document.body?.innerText || "").length, awtsKeys:Object.keys(scope).filter(k => /AWTSMOOS|MITZVAH|olam|ikar/i.test(k)).slice(0, 20), stats:compactStats(), playerFacing:playerFacingSmoke(scope), lastError:scope.__AWTSMOOS_LAST_ERROR__ ? { at:scope.__AWTSMOOS_LAST_ERROR__.at, label:scope.__AWTSMOOS_LAST_ERROR__.context?.label, message:scope.__AWTSMOOS_LAST_ERROR__.thrown?.message || scope.__AWTSMOOS_LAST_ERROR__.thrown?.string || "error" } : null }),
    keys:(codes = ["KeyW", "KeyA", "KeyS", "KeyD", "Tab", "Digit1", "Digit2", "KeyV"]) => { codes.forEach(dispatchKey); scope.__MITZVAH_LAST_KEY_TEST__ = { at:Date.now(), codes }; return { ok:true, codes, stats:compactStats(), playerFacing:playerFacingSmoke(scope) }; },
    combined:() => { const before = api.snapshot(); const keys = api.keys(); const after = api.snapshot(); return { ok:true, before, keys, after, playerFacing:api.playerFacing(), brainstorm:api.brainstorm().slice(0, 8) }; }
  };
  scope.__MITZVAH_COMPACT_SMOKE__ = api;
  return api;
}
export default installCompactLiveSmoke;
