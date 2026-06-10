#!/usr/bin/env node
/**
 * B"H
 * @file villageHouseNoBadColliderAudit.mjs
 * @description Chapter 620: The live composed village must not ship bad offset
 * invisible house colliders. The visual house remains; collision rows stay
 * empty until a debug-visible collider hull is authored and proven aligned.
 */
import fs from 'node:fs';
const village = JSON.parse(fs.readFileSync('levels/ladder/data/village.json','utf8'));
const houses = fs.readFileSync('levels/ladder/source/village/sections/houses.js','utf8');
const nature = fs.readFileSync('ckidsAwtsmoos/exports/NatureExports.js','utf8');
const rows = village.nivrayim.VillageHouseCollider || [];
const details = {
  sourceEmpty: houses.includes('VillageHouseCollider: []'),
  builtEmpty: Array.isArray(rows) && rows.length === 0,
  visualHouseStillExists: Boolean(village.nivrayim.VillagePictureProp.find(x => x.name === 'reference_main_brick_house')),
  visualOnlyReasonRecorded: houses.includes('Better no wall than a false wall'),
  cacheBustStillPresent: nature.includes('wall-only-house-solid-20260609-bh566')
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ ok:false, details, rows }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok:true, details }, null, 2));
