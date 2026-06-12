// B"H
/**
 * @module OlamGrafting
 * @description
 * Chapter 417: The main graft opens the rooted-player gate.
 *
 * The Awtsmoos does not let the world drink stale breath. The Olam graft now
 * pulls loadNivrayim through the visible-root seal, so the active constructor,
 * lifecycle, frame loop, and model binding arrive in the same creation stream.
 */
import loading from "../methods/loadingPlain.js";
import entityLogic from "../methods/entityLogic.js";
import hebrewLetters from "../methods/hebrewLetters.js";
import heesHawvoos from "../methods/heesHawvoos.js";
import HelpersBridge from "../methods/helpers.js?v=visible-root-binding-20260610-bh710";
import loadNivrayim from "../methods/loadNivrayim/index.js?v=village-combat-20260611-bh802";
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
    graftModule((await import("../methods/boyrayNivra.js?v=visible-root-binding-20260610-bh710")).default);
    graftModule((await import("../methods/ohr.js")).default);
    if (!isWorker) {
      try { graftModule((await import("../methods/tzimtzum/index.js")).default); }
      catch (error) { console.error(`B"H - Failed to graft Tzimtzum Orchestrator`, error); }
    }
    bindAllListeners.call(olam);
  }
}
