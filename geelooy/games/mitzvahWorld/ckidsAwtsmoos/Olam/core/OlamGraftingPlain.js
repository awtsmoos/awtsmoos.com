// B"H
/** Static compact grafting with active tested scene loader gate. */
import hoyseef from "../methods/hoyseef.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
import loadNivrayim from "../methods/loadNivrayim/index.js?compact=true&v=actual-tested-live-gates-20260709-bh5";
import placeholderAndEntities from "../methods/placeholderAndEntities/index.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
import loadingPlain from "../methods/loadingPlain.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
import entityLogic from "../methods/entityLogic.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
import hebrewLetters from "../methods/hebrewLetters.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
import heesHawvoos from "../methods/heesHawvoos.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
import HelpersBridge from "../methods/helpers.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
import sealayk from "../methods/sealayk.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
import canvasSetup from "../methods/canvasSetup.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
import boyrayNivra from "../methods/boyrayNivra.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
import ohr from "../methods/ohr.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
import bindAllListeners from "../eventListeners/index.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11";
const SEAL="actual-tested-live-gates-20260709-bh5";
function report(type,stage,fields={}){const payload={...fields,type,stage,text:stage,seal:SEAL,compactStaticGraft:true};try{if(typeof self!=="undefined"&&self.postMessage)self.postMessage(payload);}catch{}try{console.info('B"H | OLAM_GRAFTING_PROOF',payload);}catch{}}
function graftPrototype(olam,ClassDef,label){if(!ClassDef?.prototype)return 0;const names=Object.getOwnPropertyNames(ClassDef.prototype);let count=0;for(const name of names){if(name==="constructor")continue;olam[name]=ClassDef.prototype[name].bind(olam);count++;}report("worker_progress","olam-graft:grafted",{moduleLabel:label,methods:count});return count;}
async function graftTzimtzum(olam){try{report("worker_progress","olam-graft:browser-tzimtzum-importing",{moduleLabel:"tzimtzum browser orchestrator"});const module=await import("../methods/tzimtzum/index.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11");graftPrototype(olam,module.default,"tzimtzum browser orchestrator");}catch(error){console.error('B"H - Failed to graft Tzimtzum Orchestrator',error);}}
export default class OlamGrafting{static async graft(olam){const isWorker=typeof document==="undefined";const rows=[["hoyseef/add object",hoyseef],["load nivrayim/world scene",loadNivrayim],["placeholder/entity logic",placeholderAndEntities],["loading event methods",loadingPlain],["entity registry",entityLogic],["hebrew letters",hebrewLetters],["frame update loop",heesHawvoos],["helpers",HelpersBridge],["remove object",sealayk],["canvas setup",canvasSetup],["create nivra",boyrayNivra],["lighting/ohr",ohr]];report("worker_progress","olam-graft:start",{count:rows.length});for(const[label,ClassDef]of rows)graftPrototype(olam,ClassDef,label);if(!isWorker)await graftTzimtzum(olam);if(typeof bindAllListeners==="function")bindAllListeners.call(olam);report("worker_progress","olam-graft:done",{count:rows.length});}}
