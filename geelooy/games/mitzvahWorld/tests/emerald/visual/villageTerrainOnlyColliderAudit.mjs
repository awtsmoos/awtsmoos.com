#!/usr/bin/env node
/**
 * B"H
 * @file villageTerrainOnlyColliderAudit.mjs
 * @description Chapter 630: Village collision must remain terrain-only, no
 * hidden slab, while the current boot seal loads the collider-audited runtime.
 */
import fs from 'node:fs';
const terrainCode = fs.readFileSync('ckidsAwtsmoos/dvarim/terrain/ProceduralTerrain.js','utf8');
const nature = fs.readFileSync('ckidsAwtsmoos/exports/NatureExports.js','utf8');
const html = fs.readFileSync('index.html','utf8');
const index = fs.readFileSync('index.js','utf8');
const stamp = 'collider-audit-runtime-20260609-bh629';
function checkData(file) {
  const d = JSON.parse(fs.readFileSync(file,'utf8'));
  const terrain = d.nivrayim?.ProceduralTerrain || [];
  const hiddenRows = ['VillageHouseCollider','VillageFenceCollider','VillageRoadCollider'].flatMap(k => d.nivrayim?.[k] || []);
  return { terrainCount: terrain.length, allNoSafety: terrain.every(t => t.noSafetySlab === true && t.collisionSegments === 12), hiddenCount: hiddenRows.length };
}
const village = checkData('levels/ladder/data/village.json');
const egg = checkData('levels/ladder/data/egg-village.json');
const details = {
  codeHasSkipBranch: terrainCode.includes('TERRAIN_SAFETY_SLAB_SKIPPED') && terrainCode.includes('if (!this.noSafetySlab) this.createAndInsertSafetySlab()'),
  codeAutoSafegrass: terrainCode.includes('op.textureType === "safegrass"'),
  natureCacheBust: nature.includes('ProceduralTerrain.js?v=village-no-safety-slab-20260609-bh622'),
  bootCacheBust: html.includes(`index.js?v=${stamp}`) && index.includes(stamp),
  villageClean: village.terrainCount === 1 && village.allNoSafety && village.hiddenCount === 0,
  eggClean: egg.terrainCount === 1 && egg.allNoSafety && egg.hiddenCount === 0
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ ok:false, details, village, egg }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok:true, details }, null, 2));
