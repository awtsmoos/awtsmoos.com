#!/usr/bin/env node
/**
 * B"H
 * @file villageNoInvisibleCollidersAudit.mjs
 * @description Chapter 617: The live villages must not ship offset invisible
 * house/fence/road colliders. Visual props remain, collision rows are empty.
 */
import fs from 'node:fs';
const village = JSON.parse(fs.readFileSync('levels/ladder/data/village.json','utf8'));
const egg = JSON.parse(fs.readFileSync('levels/ladder/data/egg-village.json','utf8'));
const houses = fs.readFileSync('levels/ladder/source/village/sections/houses.js','utf8');
const fence = fs.readFileSync('levels/ladder/source/village/sections/VillageFenceCollider.js','utf8');
function emptyRows(data) { return ['VillageHouseCollider','VillageFenceCollider','VillageRoadCollider'].every(k => Array.isArray(data.nivrayim?.[k]) && data.nivrayim[k].length === 0); }
const details = {
  sourceHouseEmpty: houses.includes('VillageHouseCollider: []'),
  sourceFenceEmpty: fence.includes('export default []'),
  villageRowsEmpty: emptyRows(village),
  eggRowsEmpty: emptyRows(egg),
  visualHouseStillExists: Boolean(village.nivrayim?.VillagePictureProp?.find(x => x.name === 'reference_main_brick_house')),
  visualFenceStillExists: Boolean(village.nivrayim?.VillagePictureProp?.find(x => x.name === 'reference_left_low_fence'))
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ ok:false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok:true, details }, null, 2));
