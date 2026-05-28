// B"H
/**
 * @module OlamVessel
 * @description
 * Chapter 7: The world vessel refuses the black void.
 *
 * I traced the full visible path: page -> ikar -> manager -> worker -> Olam ->
 * loadNivrayim -> render loop. The CSS did not hide the canvas; the real risk
 * was that visibility depended on later level lighting. This vessel now creates
 * a tiny base sky/background/light floor immediately, before any level entity
 * succeeds or fails, so the canvas can never render as an unexplained black box.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import Nivra from "../../chayim/nivra.js";
import OlamGrafting from "./OlamGrafting.js";
import OlamProperties from "../properties/index.js";
import OlamInit from "./OlamInit.js?v=lean-l1-20260528-bh11";
import Ayin from "../camera/index.js";
import UserProgressManager from "../../systems/UserProgressManager.js";
import Yichud from "../interaction/Yichud.js";
import PlacementManager from "../interaction/PlacementManager.js";
import CombatManager from "../../systems/combat/CombatManager.js";

const DAY_SKY = 0x87ceeb;

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

  /** Finishes non-blocking constructor setup after method grafting. */
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

  /** Creates minimal always-on visibility so canvas/CSS mistakes are obvious. */
  installBaseVisibility() {
    if (!this.scene) return;
    this.scene.background = new THREE.Color(DAY_SKY);
    this.scene.fog = new THREE.Fog(DAY_SKY, 220, 3000);
    if (this.__baseVisibilityInstalled) return;
    this.__baseVisibilityInstalled = true;

    const ambient = new THREE.AmbientLight(0xffffff, 1.15);
    ambient.name = "Awtsmoos_Base_Ambient";
    this.scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xdff5ff, 0x8c6a3f, 1.25);
    hemi.name = "Awtsmoos_Base_Hemisphere";
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff4cf, 1.85);
    sun.name = "Awtsmoos_Base_Sun";
    sun.position.set(160, 420, 140);
    sun.castShadow = false;
    this.scene.add(sun);
  }

  get activeCamera() {
    return this._activeCamera;
  }

  set activeCamera(value) {
    this._activeCamera = value;
    this.refreshCameraAspect();
  }

  get camera() {
    return this.activeCamera || this.ayin.camera;
  }

  set pixelRatio(pixelRatio) {
    if (this.renderer) this.renderer.setPixelRatio(pixelRatio);
  }

  async init() {
    await this._facultiesGrafted;
    await OlamInit.execute(this);
    this.installBaseVisibility();
  }
}
