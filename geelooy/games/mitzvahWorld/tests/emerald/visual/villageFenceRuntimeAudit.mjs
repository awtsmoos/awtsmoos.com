#!/usr/bin/env node
/**
 * B"H
 * @file villageFenceRuntimeAudit.mjs
 * @description Chapter 631: The composed village fence is decorative only, and
 * the active boot seal must load the collider-audited runtime.
 */
import fs from 'node:fs';
const html = fs.readFileSync('index.html', 'utf8');
const index = fs.readFileSync('index.js', 'utf8');
const builder = fs.readFileSync('levels/ladder/buildVillage.mjs', 'utf8');
const section = fs.readFileSync('levels/ladder/source/village/sections/VillageFenceCollider.js', 'utf8');
const village = JSON.parse(fs.readFileSync('levels/ladder/data/village.json', 'utf8'));
const stamp = 'collider-audit-runtime-20260609-bh629';
const details = {
  htmlCacheBust: html.includes(`index.js?v=${stamp}`),
  indexSeal: index.includes(stamp),
  builderWritesLocalData: builder.includes('const outJson = "levels/ladder/data/village.json"'),
  sourceExportsEmpty: section.includes('export default []'),
  builtExportsEmpty: Array.isArray(village.nivrayim?.VillageFenceCollider) && village.nivrayim.VillageFenceCollider.length === 0,
  visualFenceStillExists: Boolean(village.nivrayim?.VillagePictureProp?.find(x => x.name === 'reference_left_low_fence'))
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ ok: false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
