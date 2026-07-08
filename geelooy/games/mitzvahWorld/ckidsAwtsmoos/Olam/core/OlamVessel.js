// B"H
/**
 * @module OlamVessel
 * @description Worker root vessel, written in conservative browser syntax so mobile parsers never choke.
 */
import { AmbientLight, Color, Fog } from "../rendering/ThreeAdapter.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import Nivra from "../../chayim/nivra.js?compact=true&v=village-combat-20260611-bh804";
import OlamGrafting from "./OlamGraftingPlain.js?compact=true&v=vehicles-u-mount-20260706-bh1";
import OlamProperties from "../properties/index.js?compact=true&v=village-combat-20260611-bh804";
import OlamInit from "./OlamInit.js?compact=true&v=village-combat-20260611-bh804";
import Ayin from "../camera/index.js?compact=true&v=village-combat-20260611-bh804";
import UserProgressManager from "../../systems/UserProgressManager.js?compact=true&v=village-combat-20260611-bh804";
import Yichud from "../interaction/Yichud.js?compact=true&v=mobile-parser-safe-20260708-bh1";
import PlacementManager from "../interaction/PlacementManager.js?compact=true&v=mobile-parser-safe-20260708-bh1";
import CombatManager from "../../systems/combat/CombatManager.js?compact=true&v=attack-cache-hard-grounding-20260701-bh1";
import { ensureWorldState, worldStateSnapshot } from "../../systems/worldState/WorldStateStore.js?compact=true&v=starter-contracts-20260628-bh9";
import { resolvePixelRatio } from "../../divine_systems/render/core/PixelRatioGovernor.js?compact=true&v=native-crisp-20260622-bh1";
import { ensureCollisionRuntime } from "../worlds/mitzvahWorld/collision/CollisionRuntime.js?compact=true&v=ground-cache-diag-20260701-bh1";

var SAFE_SKY = 0x5d8fa8;

function cleanStack(error) {
  var raw = error && error.stack ? String(error.stack) : "no stack";
  return raw.replace(/\s+/g, " ");
}

function errorMessage(error) {
  return error && error.message ? String(error.message) : String(error || "unknown error");
}

function targetSnapshot(target) {
  var mesh = target && target.mesh;
  var userData = target && target.userData;
  var health = target && target.health;
  var userHealth = userData && userData.health;
  if (!target) return null;
  return {
    name: target.name || (mesh && mesh.name) || (userData && userData.displayName) || null,
    hp: target.hp != null ? target.hp : health && health.current != null ? health.current : userHealth && userHealth.current != null ? userHealth.current : null,
    max: target.maxHp != null ? target.maxHp : health && health.max != null ? health.max : userHealth && userHealth.max != null ? userHealth.max : null
  };
}

function octreeStats(olam) {
  return {
    world: Boolean(olam && olam.worldOctree),
    interactive: Boolean(olam && olam.interactiveOctree),
    dynamicSidecar: Boolean(globalThis.__AWTS_DYNAMIC_SPATIAL__)
  };
}

function collisionDiag() {
  return typeof globalThis.__AWTS_COLLISION_DIAG__ === "function" ? globalThis.__AWTS_COLLISION_DIAG__() : null;
}

function exposeDebug(olam) {
  try {
    ensureWorldState(olam);
    ensureCollisionRuntime(olam);
    globalThis.__AWTS_OLAM__ = olam;
    globalThis.__AWTS_WORLD_STATE__ = olam.__awtsmoosWorldState;
    globalThis.__AWTS_WORLD_STATE_SNAPSHOT__ = function () { return worldStateSnapshot(olam); };
    globalThis.__AWTS_SPATIAL_DIAG__ = function () { return Object.assign({}, octreeStats(olam), { collision: collisionDiag() }); };
    globalThis.__AWTS_COMBAT_DIAG__ = function () {
      return {
        trace: olam.__combatInputTrace || [],
        attempt: olam.__lastCombatAttackAttempt || null,
        result: olam.__lastCombatAttackResult || null,
        failure: olam.__lastAttackFailure || null,
        target: targetSnapshot(olam.__selectedCombatTarget)
      };
    };
  } catch (error) {}
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
    exposeDebug(this);
    this._facultiesGrafted = OlamGrafting.graft(this);
    this._facultiesGrafted.then(() => this.finishConstructorSetup()).catch(error => {
      console.error("B\"H | Olam faculty grafting failed | message=" + errorMessage(error) + " | stack=" + cleanStack(error));
    });
  }

  finishConstructorSetup() {
    try {
      exposeDebug(this);
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
      console.error("B\"H | Olam constructor setup failed | message=" + errorMessage(error) + " | stack=" + cleanStack(error));
    }
  }

  installBaseVisibility() {
    if (!this.scene) return;
    this.scene.background = new Color(SAFE_SKY);
    this.scene.fog = new Fog(SAFE_SKY, 520, 4200);
    if (this.__baseVisibilityInstalled) return;
    this.__baseVisibilityInstalled = true;
    var ambient = new AmbientLight(0xffffff, 0.045);
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
    exposeDebug(this);
  }
}
