/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE WORLD HEESCHEEL — WorldHeescheel.js
 *   ─────────────────────────────────────────
 *   "Heescheel" (הֶאֱחִיל) — to begin, to initiate, to set in motion.
 * ════════════════════════════════════════════════════════════════════════
 */

console.log("B\"H - WorldHeescheel: Loading deep module...");

import { NIVRAYIM_DEFS } from './nivrayimDefs.js';
import { NivrahFactory } from './NivrahFactory.js';

export class WorldHeescheel {
  constructor({ scene, physics, postMsg, olam }) {
    console.log("B\"H - WorldHeescheel: Constructor called with scene:", !!scene);
    this.scene = scene;
    this.physics = physics;
    this.postMsg = postMsg;
    this.olam = olam;
  }

  async execute() {
    console.log("B\"H - WorldHeescheel: Executing ignition sequence...");

    if (!NIVRAYIM_DEFS || NIVRAYIM_DEFS.length === 0) {
      console.error(`B"H - WorldHeescheel: ❌ NIVRAYIM_DEFS is empty!`);
      this._forceReady();
      return;
    }

    console.log(`B\"H - WorldHeescheel: Building ${NIVRAYIM_DEFS.length} nivrayim...`);
    const factory = new NivrahFactory(this.scene, this.physics, this.olam);

    try {
      const results = await factory.buildAll(NIVRAYIM_DEFS);
      console.log(`B\"H - WorldHeescheel: Manifestation complete. Built ${results.size} unique souls.`);

      if (this.olam && this.olam.tzimtzum && Array.isArray(this.olam.nivrayim)) {
        const updateController = {
          id: 'mitzvahWorld_update_controller',
          isReady: true,
          heesHawvoos: (dt) => {
            if (this.olam.tzimtzum && typeof this.olam.tzimtzum.dispatch === 'function') {
              this.olam.tzimtzum.dispatch(dt);
            }
          }
        };
        this.olam.nivrayim.push(updateController);
      }

      this._signalLoaded();
    } catch (err) {
      console.error(`B"H - WorldHeescheel: 💥 Manifestation error:`, err);
      this._forceReady();
    }
  }

  _signalLoaded() {
    console.log("B\"H - WorldHeescheel: Signaling 'loadedWorld' to main thread");
    this.postMsg({ type: 'loadedWorld', payload: true });
  }

  _forceReady() {
    console.warn(`B"H - WorldHeescheel: ⚠️ Forcing readiness...`);
    this._signalLoaded();
  }
}

export default WorldHeescheel;
