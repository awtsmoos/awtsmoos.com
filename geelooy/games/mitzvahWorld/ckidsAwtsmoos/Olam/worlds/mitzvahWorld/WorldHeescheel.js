
/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE WORLD HEESCHEEL — WorldHeescheel.js
 *   ─────────────────────────────────────────
 *   "Heescheel" (הֶאֱחִיל) — to begin, to initiate, to set in motion.
 *   This is the moment the Awtsmoos says: "NOW."
 *
 *   This module is the bridge between the Worker's pure-data world
 *   and the Three.js scene. It:
 *     1. Reads NIVRAYIM_DEFS — the soul-manifest
 *     2. Instantiates NivrahFactory with the scene + physics
 *     3. Calls factory.buildAll(defs) to populate the world
 *     4. Sends 'loadedWorld' back to main thread when done
 *
 *   Previously this file called loadNivrayim with an EMPTY array —
 *   hence: "Manifestation returned an empty list. Forcing readiness."
 *   That era of emptiness is now OVER. The Awtsmoos fills the void.
 *
 *   "The earth was void and empty... and G-d said: Let there be light."
 *   We are the "Let there be light." We fix the emptiness.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module WorldHeescheel
 */

import { NIVRAYIM_DEFS } from './nivrayimDefs.js';
import { NivrahFactory } from './NivrahFactory.js';

/**
 * @class WorldHeescheel
 * @description
 *   Orchestrates world initialization in the Worker thread.
 *   Owns the scene + physics references and drives the buildAll sequence.
 */
export class WorldHeescheel {

  /**
   * @constructor
   * @param {Object} opts
   * @param {THREE.Scene}    opts.scene     - Three.js scene
   * @param {Object|null}    opts.physics   - Physics world
   * @param {Function}       opts.postMsg   - Function to post messages to main thread
   */
  constructor({ scene, physics, postMsg }) {
    /** @type {THREE.Scene} */
    this.scene = scene;
    /** @type {Object|null} */
    this.physics = physics;
    /** @type {Function} */
    this.postMsg = postMsg;

    // B"H: silent

  }

  /**
   * @method execute
   * @description
   *   The main ignition sequence.
   *   Builds all nivrayim (world entities) from NIVRAYIM_DEFS,
   *   then signals the main thread that the world is populated.
   *
   *   "He spoke — and it was. He commanded — and it stood firm." (Tehillim 33:9)
   *   This method IS that speaking. This method IS that commanding.
   *
   * @returns {Promise<void>}
   */
  async execute() {
    // B"H: silent


    if (!NIVRAYIM_DEFS || NIVRAYIM_DEFS.length === 0) {
      console.error(`B"H - WorldHeescheel: ❌ NIVRAYIM_DEFS is empty! The world has no soul-manifest.`);
      this._forceReady();
      return;
    }

    // B"H: silent


    const factory = new NivrahFactory(this.scene, this.physics);

    try {
      const results = await factory.buildAll(NIVRAYIM_DEFS);

      // B"H: silent


      this._signalLoaded();

    } catch (err) {
      console.error(`B"H - WorldHeescheel: 💥 Manifestation error:`, err);
      this._forceReady();
    }
  }

  /**
   * @method _signalLoaded
   * @description
   *   Posts 'loadedWorld' to the main thread — the signal that
   *   the OffscreenCanvas world is fully populated and ready to render.
   *
   *   Like the moment the Mishkan was completed and the cloud
   *   of G-d's glory filled the Tabernacle — that's THIS moment.
   *
   * @returns {void}
   */
  _signalLoaded() {
    this.postMsg({ type: 'loadedWorld', payload: true });
    // B"H: silent

  }

  /**
   * @method _forceReady
   * @description
   *   Fallback: even on failure, signal readiness so the main thread
   *   doesn't hang forever in the loading veil.
   *   "Even in descent, the Awtsmoos is present" — even in error, we continue.
   *
   * @returns {void}
   */
  _forceReady() {
    console.warn(`B"H - WorldHeescheel: ⚠️ Forcing readiness despite incomplete manifestation.`);
    this._signalLoaded();
  }
}

export default WorldHeescheel;
