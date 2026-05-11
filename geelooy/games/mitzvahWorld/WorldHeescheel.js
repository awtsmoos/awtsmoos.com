/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE WORLD HEESCHEEL — WorldHeescheel.js
 *   ─────────────────────────────────────────
 *   TIKKUN: Now accepts and stores `olam`, forwarding it to NivrahFactory
 *   so the factory can call olam.worldOctree.fromGraphNode() on each built object.
 *
 *   "He spoke — and it was. He commanded — and it stood firm." (Tehillim 33:9)
 *   Now when He speaks hut walls into being, they STAND FIRM in the octree!
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module WorldHeescheel
 */

import { NIVRAYIM_DEFS } from '/games/mitzvahWorld/ckidsAwtsmoos/Olam/worlds/mitzvahWorld/nivrayimDefs.js';
import { NivrahFactory } from '/games/mitzvahWorld/ckidsAwtsmoos/Olam/worlds/mitzvahWorld/NivrahFactory.js';

/**
 * @class WorldHeescheel
 * @description Orchestrates world initialization. Carries olam to the factory.
 */
export class WorldHeescheel {

  /**
   * @constructor
   * @param {Object}         opts
   * @param {THREE.Scene}    opts.scene     - Three.js scene
   * @param {Object|null}    opts.physics   - Physics world
   * @param {Function}       opts.postMsg   - Posts messages to main thread
   * @param {Object|null}    opts.olam      - Full Olam instance (has worldOctree!)
   */
  constructor({ scene, physics, postMsg, olam }) {
    /** @type {THREE.Scene} */
    this.scene = scene;
    /** @type {Object|null} */
    this.physics = physics;
    /** @type {Function} */
    this.postMsg = postMsg;
    /**
     * @type {Object|null}
     * THE KEY ADDITION: olam carries worldOctree.
     * Without this, all wall meshes are visual phantoms to the capsule collider.
     */
    this.olam = olam || null;
  }

  /**
   * @method execute
   * @description Main ignition sequence.
   * @returns {Promise<void>}
   */
  async execute() {
    // B"H: silent

    if (!NIVRAYIM_DEFS || NIVRAYIM_DEFS.length === 0) {
      console.error(`B"H - WorldHeescheel: NIVRAYIM_DEFS is empty!`);
      this._forceReady();
      return;
    }

    // Pass olam into NivrahFactory — the critical transmission
    const factory = new NivrahFactory(this.scene, this.physics, this.olam);

    try {
      await factory.buildAll(NIVRAYIM_DEFS);
      this._signalLoaded();
    } catch (err) {
      console.error(`B"H - WorldHeescheel: Manifestation error:`, err);
      this._forceReady();
    }
  }

  /**
   * @method _signalLoaded
   * @returns {void}
   */
  _signalLoaded() {
    this.postMsg({ type: 'loadedWorld', payload: true });
  }

  /**
   * @method _forceReady
   * @returns {void}
   */
  _forceReady() {
    console.warn(`B"H - WorldHeescheel: Forcing readiness despite incomplete manifestation.`);
    this._signalLoaded();
  }
}

export default WorldHeescheel;