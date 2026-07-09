// B"H
/** Static Olam vessel with optional gameplay managers deferred after first world breath. */
import Nivra from "../../chayim/nivra.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
import { AmbientLight, Color, Fog } from "../rendering/ThreeAdapter.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
import OlamGrafting from "./OlamGraftingPlain.js";
import OlamProperties from "../properties/index.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
import OlamInit from "./OlamInit.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
import Ayin from "../camera/index.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
import { ensureWorldState, worldStateSnapshot } from "../../systems/worldState/WorldStateStore.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
import { resolvePixelRatio } from "../../divine_systems/render/core/PixelRatioGovernor.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
import { ensureCollisionRuntime } from "../worlds/mitzvahWorld/collision/CollisionRuntime.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
const SAFE_SKY = 0x5d8fa8;
const SEAL = "optional-manager-defer-20260709-bh1";
const OPTIONAL = Object.freeze({
  UserProgressManager:"../../systems/UserProgressManager.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11",
  Yichud:"../interaction/Yichud.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11",
  PlacementManager:"../interaction/PlacementManager.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11",
  CombatManager:"../../systems/combat/CombatManager.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11"
});
function cleanStack(error) { return String(error?.stack || "no stack").replace(/\s+/g, " "); }
function errorMessage(error) { return error?.message ? String(error.message) : String(error || "unknown error"); }
function emitBootError(error, stage) {
  const text = `B"H | Olam boot failed | stage=${stage} | message=${errorMessage(error)} | stack=${cleanStack(error)}`;
  console.error(text);
  try { if (typeof self !== "undefined" && self.postMessage) { self.postMessage({ type:"ERROR_TEXT", message:text, details:text, errorText:text, stage }); self.postMessage({ type:"ERROR", message:text, details:text, errorText:text, stage }); } } catch {}
}
function valueFromPaths(a, b, c) { if (a !== undefined && a !== null) return a; if (b !== undefined && b !== null) return b; return c !== undefined && c !== null ? c : null; }
function targetSnapshot(target) {
  if (!target) return null;
  const mesh = target.mesh, data = target.userData, health = target.health, userHealth = data && data.health;
  return { name:target.name || mesh?.name || data?.displayName || null, hp:valueFromPaths(target.hp, health?.current, userHealth?.current), max:valueFromPaths(target.maxHp, health?.max, userHealth?.max) };
}
function octreeStats(olam) { return { world:Boolean(olam?.worldOctree), interactive:Boolean(olam?.interactiveOctree), dynamicSidecar:Boolean(globalThis.__AWTS_DYNAMIC_SPATIAL__) }; }
function collisionDiag() { return typeof globalThis.__AWTS_COLLISION_DIAG__ === "function" ? globalThis.__AWTS_COLLISION_DIAG__() : null; }
function exposeDebug(olam) {
  try {
    olam.__mods?.ensureWorldState?.(olam); olam.__mods?.ensureCollisionRuntime?.(olam);
    globalThis.__AWTS_OLAM__ = olam; globalThis.__AWTS_WORLD_STATE__ = olam.__awtsmoosWorldState;
    globalThis.__AWTS_WORLD_STATE_SNAPSHOT__ = () => olam.__mods?.worldStateSnapshot ? olam.__mods.worldStateSnapshot(olam) : null;
    globalThis.__AWTS_SPATIAL_DIAG__ = () => ({ ...octreeStats(olam), collision:collisionDiag() });
    globalThis.__AWTS_COMBAT_DIAG__ = () => ({ trace:olam.__combatInputTrace || [], attempt:olam.__lastCombatAttackAttempt || null, result:olam.__lastCombatAttackResult || null, failure:olam.__lastAttackFailure || null, target:targetSnapshot(olam.__selectedCombatTarget) });
  } catch {}
}
function loadBootModules() { return { AmbientLight, Color, Fog, OlamGrafting, OlamProperties, OlamInit, Ayin, ensureWorldState, worldStateSnapshot, resolvePixelRatio, ensureCollisionRuntime, seal:SEAL, compactStaticBoot:true, optionalManagersDeferred:true }; }
async function bootstrapOlam(olam) {
  try {
    const mods = loadBootModules(); olam.__mods = mods;
    mods.OlamProperties?.apply?.(olam); mods.ensureWorldState?.(olam); exposeDebug(olam);
    await mods.OlamGrafting?.graft?.(olam); olam.finishConstructorSetup(); return mods;
  } catch (error) { emitBootError(error, "bootstrapOlam"); throw error; }
}
async function loadOptionalManagers(olam) {
  if (olam.__optionalManagersLoading || olam.__optionalManagersReady) return olam.__optionalManagersLoading;
  olam.__optionalManagersLoading = (async () => {
    try {
      const [progress, yichud, placement, combat] = await Promise.all([import(OPTIONAL.UserProgressManager), import(OPTIONAL.Yichud), import(OPTIONAL.PlacementManager), import(OPTIONAL.CombatManager)]);
      if (!olam.userProgressManager && progress.default) olam.userProgressManager = new progress.default(olam);
      if (!olam.yichud && yichud.default) olam.yichud = new yichud.default(olam);
      if (!olam.placementManager && placement.default) olam.placementManager = new placement.default(olam);
      if (!olam.combatManager && combat.default) { olam.combatManager = new combat.default(olam); olam.combatManager?.init?.(); }
      olam.__optionalManagersReady = { ok:true, at:Date.now(), seal:SEAL };
    } catch (error) { olam.__optionalManagersReady = { ok:false, at:Date.now(), message:errorMessage(error) }; console.warn('B"H optional managers deferred load failed', error); }
    exposeDebug(olam); return olam.__optionalManagersReady;
  })();
  return olam.__optionalManagersLoading;
}
function scheduleOptionalManagers(olam) {
  if (olam.__optionalManagersScheduled) return;
  olam.__optionalManagersScheduled = true;
  const go = () => setTimeout(() => loadOptionalManagers(olam), 700);
  if (typeof window !== "undefined") window.addEventListener("awtsmoos-game-ready", go, { once:true });
  setTimeout(() => loadOptionalManagers(olam), 4200);
}
export default class Olam extends Nivra {
  constructor() {
    super(); this.ASPECT_X = 1920; this.ASPECT_Y = 1080; this.official = "official"; this.styled = false; this._activeCamera = null; this.__mods = null;
    exposeDebug(this); this._facultiesGrafted = bootstrapOlam(this);
  }
  finishConstructorSetup() {
    const mods = this.__mods || {};
    try {
      exposeDebug(this); if (this.worldOctree) this.worldOctree.olam = this; if (this.interactiveOctree) this.interactiveOctree.olam = this;
      if (mods.Ayin) this.ayin = new mods.Ayin(this); if (this.ayin?.camera) this.ayin.camera.far = 4828;
      this.installBaseVisibility(); if (this.nivrayimGroup) { this.nivrayimGroup.name = "nivrayimGroup"; this.scene?.add?.(this.nivrayimGroup); }
      if (typeof this.startShlichusHandler === "function") this.startShlichusHandler(this); if (this.octreeDebugHelper) this.octreeDebugHelper.visible = false;
      scheduleOptionalManagers(this); exposeDebug(this);
    } catch (error) { emitBootError(error, "finishConstructorSetup"); }
  }
  installBaseVisibility() {
    const mods = this.__mods || {}; if (!this.scene || !mods.Color || !mods.Fog || !mods.AmbientLight) return;
    this.scene.background = new mods.Color(SAFE_SKY); this.scene.fog = new mods.Fog(SAFE_SKY, 520, 4200);
    if (this.__baseVisibilityInstalled) return; this.__baseVisibilityInstalled = true;
    const ambient = new mods.AmbientLight(0xffffff, 0.045); ambient.name = "Awtsmoos_Base_Tiny_Ambient"; this.scene.add(ambient);
  }
  get activeCamera() { return this._activeCamera; }
  set activeCamera(value) { this._activeCamera = value; if (typeof this.refreshCameraAspect === "function") this.refreshCameraAspect(); }
  get camera() { return this.activeCamera || this.ayin?.camera; }
  set pixelRatio(pixelRatio) { if (!this.renderer) return; const mods = this.__mods || {}; const value = mods.resolvePixelRatio ? mods.resolvePixelRatio({ raw:pixelRatio, width:this.width || 1024, height:this.height || 768, phase:"resize" }) : pixelRatio; this.renderer.setPixelRatio(value); }
  async init() { await this._facultiesGrafted; if (this.__mods?.OlamInit) await this.__mods.OlamInit.execute(this); this.installBaseVisibility(); exposeDebug(this); scheduleOptionalManagers(this); }
  ensureOptionalManagers() { return loadOptionalManagers(this); }
}
