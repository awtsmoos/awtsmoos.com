// B"H
/**
 * @module OlamGrafting
 * @description Chapter 69: the world receives fresh render-error mercy. The
 * Awtsmoos refuses stale `lean` limbs; every core method is grafted with a new
 * key so the one-shot fatal reporter reaches the browser and ends console spam.
 */
import loading from "../methods/loading.js";
import entityLogic from "../methods/entityLogic.js";
import hebrewLetters from "../methods/hebrewLetters.js";
import heesHawvoos from "../methods/heesHawvoos.js?v=render-fatal-once-20260529-bh69";
import HelpersBridge from "../methods/helpers.js";
import loadNivrayim from "../methods/loadNivrayim/index.js?v=render-fatal-once-20260529-bh69";
import placeholderAndEntities from "../methods/placeholderAndEntities/index.js";
import hoyseef from "../methods/hoyseef.js";
import sealayk from "../methods/sealayk.js";
import bindAllListeners from "../eventListeners/index.js";

export default class OlamGrafting {
  /** @param {object} olam Runtime world. @returns {Promise<void>} */
  static async graft(olam) {
    const isWorker = typeof document === "undefined";
    const graftModule = ClassDef => {
      if (!ClassDef?.prototype) return;
      Object.getOwnPropertyNames(ClassDef.prototype).forEach(name => {
        if (name !== "constructor") olam[name] = ClassDef.prototype[name].bind(olam);
      });
    };
    [hoyseef, loadNivrayim, placeholderAndEntities, loading, entityLogic, hebrewLetters, heesHawvoos, HelpersBridge, sealayk].forEach(graftModule);
    const CanvasSetup = (await import("../methods/canvasSetup.js?v=render-fatal-once-20260529-bh69")).default;
    graftModule(CanvasSetup);
    const boyrayNivraClass = (await import("../methods/boyrayNivra.js?v=render-fatal-once-20260529-bh69")).default;
    graftModule(boyrayNivraClass);
    const Ohr = (await import("../methods/ohr.js?v=render-fatal-once-20260529-bh69")).default;
    graftModule(Ohr);
    if (!isWorker) {
      try {
        const tzimtzum = (await import("../methods/tzimtzum/index.js?v=render-fatal-once-20260529-bh69")).default;
        graftModule(tzimtzum);
      } catch (error) {
        console.error(`B"H - Failed to graft Tzimtzum Orchestrator`, error);
      }
    }
    bindAllListeners.call(olam);
  }
}
