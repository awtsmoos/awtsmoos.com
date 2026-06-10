#!/usr/bin/env node
/**
 * B"H
 * @file villageHouseNoBadColliderAudit.mjs
 * @description Chapter 640: The live composed village must ship measured house
 * colliders that point at real visible house props.
 */
import fs from 'node:fs';
const village = JSON.parse(fs.readFileSync('levels/ladder/data/village.json','utf8'));
const houses = fs.readFileSync('levels/ladder/source/village/sections/houses.js','utf8');
const nature = fs.readFileSync('ckidsAwtsmoos/exports/NatureExports.js','utf8');
const runtime = fs.readFileSync('ckidsAwtsmoos/dvarim/nature/VillageHouseCollider.js','utf8');
const rows = village.nivrayim.VillageHouseCollider || [];
const props = new Set((village.nivrayim.VillagePictureProp || []).map(row => row.name));
const details = {
  sourceDelegatesPictureProps: houses.includes('VillagePictureProp: pictureProps'),
  builtRowsPresent: Array.isArray(rows) && rows.length === 3,
  allTargetsVisible: rows.every(row => props.has(row.targetName)),
  visualHouseStillExists: props.has('main_warm_house'),
  runtimeMeasuresVisualBounds: runtime.includes('rebuildMeasuredHouseShell'),
  cacheBustStillPresent: nature.includes('VillageHouseCollider.js?v=lava-camera-axis-20260609-bh640')
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ ok:false, details, rows }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok:true, details }, null, 2));
