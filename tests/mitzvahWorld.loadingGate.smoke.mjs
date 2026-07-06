// B"H
import assert from "node:assert/strict";
class FakeEl {
  constructor(id){ this.id=id; this.textContent=""; this.style={}; this.removed=false; this.classList={values:new Set(), add:v=>this.classList.values.add(v)}; }
  remove(){ this.removed=true; }
}
const elements = new Map();
for (const id of ["genesisProgressBar","genesisWorldBar","genesisWorkerBar","genesisTextureBar","genesisActionText","genesisSubActionText","genesisPercentText","genesisWorkerText","genesisTextureText","genesisProgressLog"]) elements.set(id,new FakeEl(id));
const loading = new FakeEl("awtsmoosLoadingVeil");
const loadingContent = new FakeEl("loadingContent");
const canvas = { width:640, height:360, clientWidth:640, clientHeight:360 };
globalThis.requestAnimationFrame = fn => setTimeout(fn, 0);
globalThis.CustomEvent = class CustomEvent { constructor(type, init={}){ this.type=type; this.detail=init.detail; } };
globalThis.window = globalThis;
globalThis.document = {
  documentElement:new FakeEl("html"),
  getElementById:id=>elements.get(id)||null,
  querySelector:sel=>sel==="canvas"?canvas:null,
  querySelectorAll:sel=>sel.includes(".loading")?[loading,loadingContent]:[]
};
globalThis.addEventListener = () => {};
globalThis.dispatchEvent = () => true;
const mod = await import("../geelooy/games/mitzvahWorld/ckidsAwtsmoos/Olam/uiManager/logic/LoadingProgressBridge.js?test=loading-gate-smoke");
mod.update({stage:"load-nivrayim:start",total:55});
assert.equal(mod.isFinalReady(), false);
assert.equal(mod.hideLoading("too early"), false);
await new Promise(r=>setTimeout(r,5));
assert.equal(loading.removed,false);
assert.equal(loadingContent.removed,false);
assert.equal(globalThis.__AWTSMOOS_BOOT_LOADED__, undefined);
assert.equal(mod.markFinalReady("loadedWorld"), false);
await new Promise(r=>setTimeout(r,5));
assert.equal(loading.removed,false);
assert.equal(mod.markFinalReady("world_final_ready"), true);
await new Promise(r=>setTimeout(r,30));
assert.equal(mod.isFinalReady(), true);
assert.equal(loading.removed,true);
assert.equal(loadingContent.removed,true);
assert.equal(globalThis.__AWTSMOOS_BOOT_LOADED__, true);
assert.equal(globalThis.__AWTSMOOS_LOADING_HIDDEN_PROOF__.canvasReady,true);
const diag = globalThis.__AWTSMOOS_LAST_LOAD_DIAG__();
assert.equal(diag.loading.neverResetToZeroAfterPositive,true);
assert.ok(diag.loading.loadingHiddenMs >= 0);
console.log("B'H mitzvahWorld.loadingGate.smoke passed", {hidden:diag.hidden, finalReady:diag.finalReady, canvasReady:diag.canvasReady});
