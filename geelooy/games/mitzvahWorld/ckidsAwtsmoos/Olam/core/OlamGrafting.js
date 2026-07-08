// B"H
/** @module OlamGrafting @description Main graft imports current visible village loader. */
import loading from "../methods/loadingPlain.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import entityLogic from "../methods/entityLogic.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import hebrewLetters from "../methods/hebrewLetters.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import heesHawvoos from "../methods/heesHawvoos.js?compact=true&v=render-hazard-quarantine-20260706-bh1";
import HelpersBridge from "../methods/helpers.js?compact=true&v=visible-root-binding-20260610-bh710";
import loadNivrayim from "../methods/loadNivrayim/index.js?compact=true&v=npc-source-body-prune-20260708-bh1";
import placeholderAndEntities from "../methods/placeholderAndEntities/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import hoyseef from "../methods/hoyseef.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import sealayk from "../methods/sealayk.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import bindAllListeners from "../eventListeners/index.js?compact=true&v=starter-contracts-20260628-bh9";
function graftPrototype(olam,ClassDef){if(!ClassDef?.prototype)return;Object.getOwnPropertyNames(ClassDef.prototype).forEach(name=>{if(name!=="constructor")olam[name]=ClassDef.prototype[name].bind(olam);});}
export default class OlamGrafting{static async graft(olam){const isWorker=typeof document==="undefined";console.info('B"H | OLAM_GRAFTING_PROOF',{stage:'graft-start',loader:'fps-door-target-idle-20260708-bh1'});[hoyseef,loadNivrayim,placeholderAndEntities,loading,entityLogic,hebrewLetters,heesHawvoos,HelpersBridge,sealayk].forEach(C=>graftPrototype(olam,C));graftPrototype(olam,(await import("../methods/canvasSetup.js?compact=true&v=high-performance-context-20260621-bh1")).default);graftPrototype(olam,(await import("../methods/boyrayNivra.js?compact=true&v=visible-root-binding-20260610-bh710")).default);graftPrototype(olam,(await import("../methods/ohr.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1")).default);if(!isWorker){try{graftPrototype(olam,(await import("../methods/tzimtzum/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1")).default);}catch(error){console.error('B"H - Failed to graft Tzimtzum Orchestrator',error);}}bindAllListeners.call(olam);}}
