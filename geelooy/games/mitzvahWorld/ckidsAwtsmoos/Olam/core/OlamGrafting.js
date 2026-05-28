// B"H
/**
 * @module OlamGrafting
 * @description Chapter 12: The world receives bh17 limbs only.
 */
import loading from "../methods/loading.js";
import entityLogic from "../methods/entityLogic.js";
import hebrewLetters from "../methods/hebrewLetters.js";
import heesHawvoos from "../methods/heesHawvoos.js?v=lean-l1-20260528-bh17";
import HelpersBridge from "../methods/helpers.js";
import loadNivrayim from "../methods/loadNivrayim/index.js?v=lean-l1-20260528-bh17";
import placeholderAndEntities from "../methods/placeholderAndEntities/index.js";
import hoyseef from "../methods/hoyseef.js";
import sealayk from "../methods/sealayk.js";
import bindAllListeners from "../eventListeners/index.js";

export default class OlamGrafting {
  /** Grafts safe Olam methods into a runtime vessel. */
  static async graft(olam) {
    const isWorker = typeof document === "undefined";
    const graftModule = ClassDef => {
      if (!ClassDef?.prototype) return;
      Object.getOwnPropertyNames(ClassDef.prototype).forEach(name => {
        if (name !== "constructor") olam[name] = ClassDef.prototype[name].bind(olam);
      });
    };

    [hoyseef, loadNivrayim, placeholderAndEntities, loading, entityLogic, hebrewLetters, heesHawvoos, HelpersBridge, sealayk].forEach(graftModule);

    const CanvasSetup = (await import("../methods/canvasSetup.js?v=lean-l1-20260528-bh17")).default;
    graftModule(CanvasSetup);
    const boyrayNivraClass = (await import("../methods/boyrayNivra.js?v=lean-l1-20260528-bh17")).default;
    graftModule(boyrayNivraClass);
    const Ohr = (await import("../methods/ohr.js?v=lean-l1-20260528-bh17")).default;
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
