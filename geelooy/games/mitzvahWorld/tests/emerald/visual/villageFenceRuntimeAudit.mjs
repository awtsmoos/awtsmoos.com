#!/usr/bin/env node
/**
 * B"H
 * @file villageFenceRuntimeAudit.mjs
 * @description Chapter 640: The composed village fence has visible rails and
 * matching solid collider rows, under the active boot seal.
 */
import fs from 'node:fs';
const html = fs.readFileSync('index.html', 'utf8');
const index = fs.readFileSync('index.js', 'utf8');
const builder = fs.readFileSync('levels/ladder/buildVillage.mjs', 'utf8');
const section = fs.readFileSync('levels/ladder/source/village/sections/VillageFenceCollider.js', 'utf8');
const village = JSON.parse(fs.readFileSync('levels/ladder/data/village.json', 'utf8'));
const stamp = 'lava-camera-collision-bypass-20260609-bh643';
const rows = village.nivrayim?.VillageFenceCollider || [];
const details = {
  htmlCacheBust: html.includes(`index.js?v=${stamp}`),
  indexSeal: index.includes(stamp),
  builderWritesLocalData: builder.includes('const outJson = "levels/ladder/data/village.json"'),
  sourceExportsSolidRows: section.includes('isSolid: true') && section.includes('village_front_fence_collider'),
  builtExportsSolidRows: rows.length === 3 && rows.every(row => row.isSolid === true),
  visualFenceStillExists: Boolean(village.nivrayim?.VillagePictureProp?.find(x => x.name === 'short_fence_left'))
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ ok: false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
