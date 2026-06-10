// B"H
/**
 * @module OlamGraftingPlain
 * @description
 * Chapter 330: the worker graft drinks from player registration and model-load witnesses.
 */
import loading from "../methods/loadingPlain.js";
import entityLogic from "../methods/entityLogic.js";
import hebrewLetters from "../methods/hebrewLetters.js";
import heesHawvoos from "../methods/heesHawvoos.js";
import HelpersBridge from "../methods/helpers.js?v=chossid-model-load-20260610-bh709";
import loadNivrayim from "../methods/loadNivrayim/index.js?v=physics-motion-trace-20260610-bh708";
import placeholderAndEntities from "../methods/placeholderAndEntities/index.js";
import hoyseef from "../methods/hoyseef.js";
import sealayk from "../methods/sealayk.js";
import bindAllListeners from "../eventListeners/index.js";

export default class OlamGraftingPlain {
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
    graftModule((await import("../methods/boyrayNivra.js?v=chossid-model-load-20260610-bh709")).default);
    graftModule((await import("../methods/ohr.js")).default);
    if (!isWorker) {
      try { graftModule((await import("../methods/tzimtzum/index.js")).default); }
      catch (error) { console.error(`B"H - Failed to graft Tzimtzum Orchestrator`, error); }
    }
    bindAllListeners.call(olam);
  }
}
