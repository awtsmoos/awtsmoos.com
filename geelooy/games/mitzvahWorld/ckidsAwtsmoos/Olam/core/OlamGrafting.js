// B"H
/**
 * @module OlamGrafting
 * @description
 * Chapter 2: The world receives only the limbs it needs.
 *
 * The Awtsmoos reveals the Olam through explicit grafts. The loader now comes
 * from the modular `methods/loadNivrayim/index.js` path, not the older legacy
 * gateway, reducing stale code paths that could revive placeholder/entity
 * chains during the clean Level 1 worker boot.
 */
import loading from "../methods/loading.js";
import entityLogic from "../methods/entityLogic.js";
import hebrewLetters from "../methods/hebrewLetters.js";
import heesHawvoos from "../methods/heesHawvoos.js";
import HelpersBridge from "../methods/helpers.js";
import loadNivrayim from "../methods/loadNivrayim/index.js?v=lean-l1-20260528-bh6";
import placeholderAndEntities from "../methods/placeholderAndEntities/index.js";
import hoyseef from "../methods/hoyseef.js";
import sealayk from "../methods/sealayk.js";
import bindAllListeners from "../eventListeners/index.js";

export default class OlamGrafting {
  /**
   * Grafts safe Olam methods into a runtime vessel.
   *
   * @param {object} olam Runtime world vessel.
   * @returns {Promise<void>}
   */
  static async graft(olam) {
    const isWorker = typeof document === "undefined";
    const graftModule = ClassDef => {
      if (!ClassDef?.prototype) return;
      Object.getOwnPropertyNames(ClassDef.prototype).forEach(name => {
        if (name !== "constructor") olam[name] = ClassDef.prototype[name].bind(olam);
      });
    };

    [
      hoyseef,
      loadNivrayim,
      placeholderAndEntities,
      loading,
      entityLogic,
      hebrewLetters,
      heesHawvoos,
      HelpersBridge,
      sealayk
    ].forEach(graftModule);

    const CanvasSetup = (await import("../methods/canvasSetup.js")).default;
    graftModule(CanvasSetup);

    const boyrayNivraClass = (await import("../methods/boyrayNivra.js?v=lean-l1-20260528-bh6")).default;
    graftModule(boyrayNivraClass);

    const Ohr = (await import("../methods/ohr.js")).default;
    graftModule(Ohr);

    if (!isWorker) {
      try {
        const tzimtzum = (await import("../methods/tzimtzum/index.js")).default;
        graftModule(tzimtzum);
      } catch (error) {
        console.error(`B"H - Failed to graft Tzimtzum Orchestrator`, error);
      }
    }

    bindAllListeners.call(olam);
  }
}
