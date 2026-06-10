#!/usr/bin/env node
/**
 * B"H
 * @file terrainVisualOnlyAudit.mjs
 * @description Chapter 624: Decorative lava terrain must not generate hidden
 * colliders when isSolid:false, and village safegrass must skip the hidden
 * safety slab while keeping its lawful surface collider.
 */
import fs from 'node:fs';
const terrain = fs.readFileSync('ckidsAwtsmoos/dvarim/terrain/ProceduralTerrain.js','utf8');
const material = fs.readFileSync('ckidsAwtsmoos/dvarim/terrain/core/TerrainMaterialScribe.js','utf8');
const details = {
  storesIsSolidFalse: terrain.includes('this.isSolid = op.isSolid !== false'),
  solidCreatesCollider: terrain.includes('if (this.isSolid)') && terrain.includes('this.createAndInsertCollider()'),
  safetySlabConditional: terrain.includes('if (!this.noSafetySlab) this.createAndInsertSafetySlab()') && terrain.includes('TERRAIN_SAFETY_SLAB_SKIPPED'),
  visualOnlyLog: terrain.includes('TERRAIN_VISUAL_ONLY_NO_COLLIDER'),
  lavaPalette: material.includes('lavaBasin') && material.includes('if (/lava|basalt|ash/i.test(raw))')
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ok:false,details},null,2)); process.exit(1); }
console.log(JSON.stringify({ok:true,details},null,2));
