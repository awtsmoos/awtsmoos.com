#!/usr/bin/env node
/**
 * B"H
 * @file finalColliderTimingAudit.mjs
 * @description Chapter 574: Village colliders must be baked only in the final
 * delayed phase after multiple visual-settle passes.
 */
import fs from 'node:fs';
const code = fs.readFileSync('ckidsAwtsmoos/Olam/methods/loadNivrayim/villageGrounding.js','utf8');
const details = {
  finalLog: code.includes('VILLAGE_FINAL_COLLIDERS_AFTER_ALL_SETTLE'),
  preNoColliderLog: code.includes('VILLAGE_VISUAL_SETTLE_NO_COLLIDERS'),
  multiSettle: code.includes('afterFrames(2') && code.includes('afterFrames(5') && code.includes('afterFrames(8'),
  finalDelay: code.includes('1650'),
  guardedOnce: code.includes('!olam.__villageFinalCollidersBaked'),
  finalPhaseLabel: code.includes('final-only-after-settle'),
  finiteGuard: code.includes('finiteObject') && code.includes('colliderReady')
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ ok:false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok:true, details }, null, 2));
