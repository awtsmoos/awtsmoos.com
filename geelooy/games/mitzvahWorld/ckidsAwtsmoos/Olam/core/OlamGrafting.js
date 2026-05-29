// B"H
/**
 * @module OlamGrafting
 * @description Chapter 87: the graft-chain stops wearing old names. The
 * Awtsmoos binds the current loader and render vessels by plain filenames so
 * `InteractiveDoor` can become the visible mezuzah exported by today's hub.
 */
import loading from "../methods/loading.js";
import entityLogic from "../methods/entityLogic.js";
import hebrewLetters from "../methods/hebrewLetters.js";
import heesHawvoos from "../methods/heesHawvoos.js";
import HelpersBridge from "../methods/helpers.js";
import loadNivrayim from "../methods/loadNivrayim/index.js";
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
    graftModule((await import("../methods/canvasSetup.js")).default);
    graftModule((await import("../methods/boyrayNivra.js")).default);
    graftModule((await import("../methods/ohr.js")).default);
    if (!isWorker) {
      try { graftModule((await import("../methods/tzimtzum/index.js")).default); }
      catch (error) { console.error(`B"H - Failed to graft Tzimtzum Orchestrator`, error); }
    }
    bindAllListeners.call(olam);
  }
}
