
/**
 * B"H
 * @module OlamVessel
 * @description
 * The Olam vessel.
 *
 * Critical fix:
 * this file must NOT import Nivra from the broad ChayimExports barrel.
 *
 * The barrel imports many life classes at once, including Chai-related chains.
 * That can pull vehicle.js while Chai is still initializing and cause:
 *
 * Cannot access 'Chai' before initialization
 *
 * So this file imports only the one actual base class it needs:
 *
 * ../../chayim/nivra.js
 */

import * as THREE from "/games/scripts/build/three.module.js";
import Nivra from "../../chayim/nivra.js";
import OlamGrafting from "./OlamGrafting.js";
import OlamProperties from "../properties/index.js";
import OlamInit from "./OlamInit.js";
import Ayin from "../camera/index.js";
import UserProgressManager from "../../systems/UserProgressManager.js";
import Yichud from "../interaction/Yichud.js";
import PlacementManager from "../interaction/PlacementManager.js";
import CombatManager from "../../systems/combat/CombatManager.js";

/**
 * B"H
 * The world vessel.
 */
export default class Olam extends Nivra {
  /**
   * B"H
   * Creates the world vessel.
   */
  constructor() {
    super();

    this.ASPECT_X = 1920;
    this.ASPECT_Y = 1080;
    this.official = "official";
    this.styled = false;
    this._activeCamera = null;

    OlamProperties.apply(this);

    this._facultiesGrafted = OlamGrafting.graft(this);

    this._facultiesGrafted
      .then(() => {
        try {
          this.worldOctree.olam = this;
          this.interactiveOctree.olam = this;

          this.ayin = new Ayin(this);
          this.ayin.camera.far = 4828;

          this.scene.background = new THREE.Color(0x88ccee);

          this.nivrayimGroup.name = "nivrayimGroup";
          this.scene.add(this.nivrayimGroup);

          this.scene.fog = new THREE.Fog(
            0x88ccee,
            this.ayin.camera.near,
            this.ayin.camera.far
          );

          this.userProgressManager = new UserProgressManager(this);
          this.yichud = new Yichud(this);
          this.placementManager = new PlacementManager(this);
          this.combatManager = new CombatManager(this);
          this.combatManager.init();

          this.startShlichusHandler(this);

          this.octreeDebugHelper.visible = false;
        } catch (error) {
          console.error(
            `B"H | Olam constructor setup failed | message=${error?.message || String(error)} | stack=${String(error?.stack || "no stack").replace(/\s+/g, " ")}`
          );
        }
      })
      .catch(error => {
        console.error(
          `B"H | Olam faculty grafting failed | message=${error?.message || String(error)} | stack=${String(error?.stack || "no stack").replace(/\s+/g, " ")}`
        );
      });
  }

  /**
   * B"H
   * @returns {any}
   * Active camera.
   */
  get activeCamera() {
    return this._activeCamera;
  }

  /**
   * B"H
   * @param {any} value
   * Active camera.
   */
  set activeCamera(value) {
    this._activeCamera = value;
    this.refreshCameraAspect();
  }

  /**
   * B"H
   * @returns {any}
   * Active camera or default ayin camera.
   */
  get camera() {
    return this.activeCamera || this.ayin.camera;
  }

  /**
   * B"H
   * @param {number} pixelRatio
   * Renderer pixel ratio.
   */
  set pixelRatio(pixelRatio) {
    if (this.renderer) {
      this.renderer.setPixelRatio(pixelRatio);
    }
  }

  /**
   * B"H
   * Initializes the world after faculties are grafted.
   *
   * @returns {Promise<void>}
   */
  async init() {
    await this._facultiesGrafted;
    await OlamInit.execute(this);
  }
}
