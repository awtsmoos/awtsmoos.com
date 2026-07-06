// B"H
/** @module OlamGraftingPlain @description Worker graft imports bh9 loader and frame profiler. */
import loading from "../methods/loadingPlain.js";
import entityLogic from "../methods/entityLogic.js";
import hebrewLetters from "../methods/hebrewLetters.js";
import heesHawvoos from "../methods/heesHawvoos.js?v=render-hazard-quarantine-20260706-bh1";
import HelpersBridge from "../methods/helpers.js?v=visible-root-binding-20260610-bh710";
import loadNivrayim from "../methods/loadNivrayim/index.js?v=perf-tight-collision-20260703-bh3";
import placeholderAndEntities from "../methods/placeholderAndEntities/index.js";
import hoyseef from "../methods/hoyseef.js";
import sealayk from "../methods/sealayk.js";
import bindAllListeners from "../eventListeners/index.js?v=starter-contracts-20260628-bh9";
export default class OlamGraftingPlain { static async graft(olam) { const isWorker = typeof document === "undefined"; const graftModule = ClassDef => { if (!ClassDef?.prototype) return; Object.getOwnPropertyNames(ClassDef.prototype).forEach(name => { if (name !== "constructor") olam[name] = ClassDef.prototype[name].bind(olam); }); }; [hoyseef, loadNivrayim, placeholderAndEntities, loading, entityLogic, hebrewLetters, heesHawvoos, HelpersBridge, sealayk].forEach(graftModule); graftModule((await import("../methods/canvasSetup.js?v=high-performance-context-20260621-bh1")).default); graftModule((await import("../methods/boyrayNivra.js?v=visible-root-binding-20260610-bh710")).default); graftModule((await import("../methods/ohr.js?v=npc-runtime-cachebreak-20260616-bh1")).default); if (!isWorker) { try { graftModule((await import("../methods/tzimtzum/index.js?v=npc-runtime-cachebreak-20260616-bh1")).default); } catch (error) { console.error(`B"H - Failed to graft Tzimtzum Orchestrator`, error); } } bindAllListeners.call(olam); } }
