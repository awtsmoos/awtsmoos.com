#!/usr/bin/env node
/**
 * B"H
 * @file villageNoInvisibleCollidersAudit.mjs
 * @description Chapter 640: The live village ships measured house and fence
 * collider rows, each tied to visible props instead of stale reference names.
 */
import fs from 'node:fs';
const village = JSON.parse(fs.readFileSync('levels/ladder/data/village.json','utf8'));
const egg = JSON.parse(fs.readFileSync('levels/ladder/data/egg-village.json','utf8'));
const houses = fs.readFileSync('levels/ladder/source/village/sections/houses.js','utf8');
const houseCollider = fs.readFileSync('levels/ladder/source/village/sections/VillageHouseCollider.js','utf8');
const fence = fs.readFileSync('levels/ladder/source/village/sections/VillageFenceCollider.js','utf8');
const props = village.nivrayim?.VillagePictureProp || [];
const propNames = new Set(props.map(row => row.name));
const houseRows = village.nivrayim?.VillageHouseCollider || [];
const fenceRows = village.nivrayim?.VillageFenceCollider || [];
function emptyRows(data) { return ['VillageHouseCollider','VillageFenceCollider','VillageRoadCollider'].every(k => Array.isArray(data.nivrayim?.[k]) && data.nivrayim[k].length === 0); }
const details = {
  sourceDelegatesPictureProps: houses.includes('VillagePictureProp: pictureProps'),
  sourceHouseTargetsPresent: ['main_warm_house','left_meadow_house','right_orchard_house'].every(name => houseCollider.includes(name)),
  sourceFenceRowsPresent: fence.includes('village_front_fence_collider') && fence.includes('village_right_return_fence_collider'),
  villageHouseRowsPresent: houseRows.length === 3 && houseRows.every(row => propNames.has(row.targetName)),
  villageFenceRowsPresent: fenceRows.length === 3,
  eggRowsEmpty: emptyRows(egg),
  visualHouseStillExists: propNames.has('main_warm_house'),
  staleReferenceGone: !propNames.has('reference_main_brick_house')
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ ok:false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok:true, details }, null, 2));
