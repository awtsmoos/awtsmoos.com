// B"H
/** @module OlamVessel @description Worker root: direct imports, spatial truth, debug vessels. */
import * as THREE from "/games/scripts/build/three.module.js";
import Nivra from "../../chayim/nivra.js?v=village-combat-20260611-bh804";
import OlamGrafting from "./OlamGraftingPlain.js?v=combat-diagnostic-graft-20260615-bh918";
import OlamProperties from "../properties/index.js?v=village-combat-20260611-bh804";
import OlamInit from "./OlamInit.js?v=village-combat-20260611-bh804";
import Ayin from "../camera/index.js?v=village-combat-20260611-bh804";
import UserProgressManager from "../../systems/UserProgressManager.js?v=village-combat-20260611-bh804";
import Yichud from "../interaction/Yichud.js?compact=true";
import PlacementManager from "../interaction/PlacementManager.js?compact=true";
import CombatManager from "../../systems/combat/CombatManager.js?v=mobile-assisted-range-20260615-bh917";
import { ensureWorldState, worldStateSnapshot } from "../../systems/worldState/WorldStateStore.js?v=world-state-store-20260615-bh1";
import { resolvePixelRatio } from "../../divine_systems/render/core/PixelRatioGovernor.js?compact=true&v=android-settings-render-20260612-bh1";
import { installDynamicSpatialWorld } from "../../../../systems/spatial/DynamicSpatialWorld.js?v=dynamic-spatial-world-20260617-bh2";

const SAFE_SKY = 0x5d8fa8;

function targetSnapshot(target) {
  if (!target) return null;
  return {
    name: target.name || target.mesh?.name || target.userData?.displayName || null,
    hp: target.hp ?? target.health?.current ?? target.userData?.health?.current ?? null,
    max: target.maxHp ?? target.health?.max ?? target.userData?.health?.max ?? null
  };
}

function exposeDebug(olam) {
  try {
    ensureWorldState(olam);
    globalThis.__AWTS_OLAM__ = olam;
    globalThis.__AWTS_WORLD_STATE__ = olam.__awtsmoosWorldState;
    globalThis.__AWTS_WORLD_STATE_SNAPSHOT__ = () => worldStateSnapshot(olam);
    globalThis.__AWTS_SPATIAL_DIAG__ = () => olam.dynamicSpatial?.snapshot?.() || null;
    globalThis.__AWTS_COMBAT_DIAG__ = () => ({
      trace: olam.__combatInputTrace || [],
      attempt: olam.__lastCombatAttackAttempt || null,
      result: olam.__lastCombatAttackResult || null,
      failure: olam.__lastAttackFailure || null,
      target: targetSnapshot(olam.__selectedCombatTarget)
    });
  } catch {}
}

export default class Olam extends Nivra {
  constructor() {
    super();
    this.ASPECT_X = 1920;
    this.ASPECT_Y = 1080;
    this.official = "official";
    this.styled = false;
    this._activeCamera = null;
    OlamProperties.apply(this);
    ensureWorldState(this);
    installDynamicSpatialWorld(this);
    exposeDebug(this);
    this._facultiesGrafted = OlamGrafting.graft(this);
    this._facultiesGrafted.then(() => this.finishConstructorSetup()).catch(error => {
      console.error(`B"H | Olam faculty grafting failed | message=${error?.message || String(error)} | stack=${String(error?.stack || "no stack").replace(/\s+/g, " ")}`);
    });
  }

  finishConstructorSetup() {
    try {
      exposeDebug(this);
      installDynamicSpatialWorld(this);
      this.worldOctree.olam = this;
      this.interactiveOctree.olam = this;
      this.ayin = new Ayin(this);
      this.ayin.camera.far = 4828;
      this.installBaseVisibility();
      this.nivrayimGroup.name = "nivrayimGroup";
      this.scene.add(this.nivrayimGroup);
      this.userProgressManager = new UserProgressManager(this);
      this.yichud = new Yichud(this);
      this.placementManager = new PlacementManager(this);
      this.combatManager = new CombatManager(this);
      this.combatManager.init();
      this.startShlichusHandler(this);
      this.octreeDebugHelper.visible = false;
      exposeDebug(this);
    } catch (error) {
      console.error(`B"H | Olam constructor setup failed | message=${error?.message || String(error)} | stack=${String(error?.stack || "no stack").replace(/\s+/g, " ")}`);
    }
  }

  installBaseVisibility() {
    if (!this.scene) return;
    this.scene.background = new THREE.Color(SAFE_SKY);
    this.scene.fog = new THREE.Fog(SAFE_SKY, 520, 4200);
    if (this.__baseVisibilityInstalled) return;
    this.__baseVisibilityInstalled = true;
    const ambient = new THREE.AmbientLight(0xffffff, 0.045);
    ambient.name = "Awtsmoos_Base_Tiny_Ambient";
    this.scene.add(ambient);
  }

  get activeCamera() { return this._activeCamera; }
  set activeCamera(value) { this._activeCamera = value; this.refreshCameraAspect(); }
  get camera() { return this.activeCamera || this.ayin.camera; }
  set pixelRatio(pixelRatio) {
    if (!this.renderer) return;
    this.renderer.setPixelRatio(resolvePixelRatio({ raw: pixelRatio, width: this.width || 1024, height: this.height || 768, phase: "resize" }));
  }

  async init() {
    await this._facultiesGrafted;
    await OlamInit.execute(this);
    this.installBaseVisibility();
    installDynamicSpatialWorld(this);
    exposeDebug(this);
  }
}
