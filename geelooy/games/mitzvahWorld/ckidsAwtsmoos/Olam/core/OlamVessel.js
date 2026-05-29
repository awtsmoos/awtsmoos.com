// B"H
/**
 * @module OlamVessel
 * @description Chapter 75: the root vessel refuses stale grafts. The Awtsmoos
 * refreshes the OlamGrafting import itself so the worker does not boot a fresh
 * shell around an old Olam that still interprets the moving bridge as a cube.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import Nivra from "../../chayim/nivra.js";
import OlamGrafting from "./OlamGrafting.js?v=wide-platform-real-boot-chain-20260529-bh75";
import OlamProperties from "../properties/index.js";
import OlamInit from "./OlamInit.js?v=wide-platform-real-boot-chain-20260529-bh75";
import Ayin from "../camera/index.js?v=wide-platform-real-boot-chain-20260529-bh75";
import UserProgressManager from "../../systems/UserProgressManager.js";
import Yichud from "../interaction/Yichud.js";
import PlacementManager from "../interaction/PlacementManager.js";
import CombatManager from "../../systems/combat/CombatManager.js";

const SAFE_SKY = 0x5d8fa8;

export default class Olam extends Nivra {
  constructor() {
    super();
    this.ASPECT_X = 1920;
    this.ASPECT_Y = 1080;
    this.official = "official";
    this.styled = false;
    this._activeCamera = null;
    OlamProperties.apply(this);
    this._facultiesGrafted = OlamGrafting.graft(this);
    this._facultiesGrafted.then(() => this.finishConstructorSetup()).catch(error => {
      console.error(`B"H | Olam faculty grafting failed | message=${error?.message || String(error)} | stack=${String(error?.stack || "no stack").replace(/\s+/g, " ")}`);
    });
  }

  /** @returns {void} Finishes non-blocking constructor setup after method grafting. */
  finishConstructorSetup() {
    try {
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
    } catch (error) {
      console.error(`B"H | Olam constructor setup failed | message=${error?.message || String(error)} | stack=${String(error?.stack || "no stack").replace(/\s+/g, " ")}`);
    }
  }

  /** @returns {void} Creates a non-invasive fallback background and ambient candle. */
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
  set pixelRatio(pixelRatio) { if (this.renderer) this.renderer.setPixelRatio(pixelRatio); }

  /** @returns {Promise<void>} Initializes the Olam vessel. */
  async init() {
    await this._facultiesGrafted;
    await OlamInit.execute(this);
    this.installBaseVisibility();
  }
}
