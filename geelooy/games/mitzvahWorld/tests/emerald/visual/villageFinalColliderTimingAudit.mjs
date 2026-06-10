#!/usr/bin/env node
/**
 * B"H
 * @file villageFinalColliderTimingAudit.mjs
 * @description Chapter 575: Village colliders bake once after all visual settle
 * passes, not during the early grounding passes.
 */
import fs from 'node:fs';
const grounding = fs.readFileSync('ckidsAwtsmoos/Olam/methods/loadNivrayim/villageGrounding.js','utf8');
const load = fs.readFileSync('ckidsAwtsmoos/Olam/methods/loadNivrayim/index.js','utf8');
const soul = fs.readFileSync('ckidsAwtsmoos/Olam/oyved/core/pawsawch/SoulLoader.js','utf8');
const details = {
  oneBakeGuard: grounding.includes('!olam.__villageFinalCollidersBaked') && grounding.includes('olam.__villageFinalCollidersBaked = true'),
  scheduledOnce: grounding.includes('olam.__villageGroundingScheduled') && !grounding.includes('[0, 1, 2, 4, 8, 16]'),
  finalDelay: grounding.includes('1650') && grounding.includes('afterFrames(8'),
  finalLog: grounding.includes('VILLAGE_FINAL_COLLIDERS_AFTER_ALL_SETTLE'),
  preSettleNoCollider: grounding.includes('VILLAGE_VISUAL_SETTLE_NO_COLLIDERS'),
  finalPhaseLabel: grounding.includes('final-only-after-settle'),
  finiteGuard: grounding.includes('finiteObject') && grounding.includes('colliderReady'),
  loadCacheBust: load.includes('final-colliders-after-settle-20260609-bh571') && soul.includes('final-colliders-after-settle-20260609-bh571')
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ok:false,details},null,2)); process.exit(1); }
console.log(JSON.stringify({ok:true,details},null,2));
