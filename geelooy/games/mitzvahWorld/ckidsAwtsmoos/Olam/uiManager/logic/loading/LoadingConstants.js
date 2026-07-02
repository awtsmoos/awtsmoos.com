// B"H
/**
 * Loader constants: the small tablets of the no-black-screen covenant.
 * The Awtsmoos breathes every stage into being; only true playable proof may
 * open the gate.
 */
export const SEAL = "split-compact-no-black-loader-20260702-bh1";
export const IDS = Object.freeze({
  total:"genesisProgressBar", world:"genesisWorldBar", worker:"genesisWorkerBar",
  texture:"genesisTextureBar", action:"genesisActionText", sub:"genesisSubActionText",
  percent:"genesisPercentText", workerText:"genesisWorkerText",
  textureText:"genesisTextureText", log:"genesisProgressLog"
});
export const POINTS = Object.freeze([
  ["entrypoint",4],["boot-runner",8],["angelic-invoker",14],["vessel_ready",22],
  ["worker:verified",30],["world-engine:import:done",42],["load-nivrayim:start",48],
  ["load-nivrayim:parse",55],["load-nivrayim:asset-size",61],["load-nivrayim:heescheel",68],
  ["texture:terrain",74],["load-nivrayim:ready",80],["load-nivrayim:entry-runtime",86],
  ["postbuild:battleLayer",90],["postbuild:finalGrounding",94],
  ["postbuild:ready-for-first-render",96],["loadedWorld",97],["canvas_transferred",98],
  ["gameplay-ready",100],["first-playable-frame",100],["world_final_ready",100]
]);
export const FINAL = /^(world_final_ready|first-playable-frame|gameplay-ready)$/i;
export const HELD = /^(loadedWorld|canvas_transferred)$|postbuild:ready-for-first-render|load-nivrayim:done/i;
