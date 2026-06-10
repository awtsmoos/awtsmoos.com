#!/usr/bin/env node
/** B"H @file villageGrassNoBlackAudit.mjs @description Chapter 557: village.json must not load the black mobile grass mesh. */
import fs from 'node:fs';
const village = JSON.parse(fs.readFileSync('levels/ladder/data/village.json','utf8'));
const foliage = fs.readFileSync('levels/ladder/source/village/sections/foliage.js','utf8');
const nature = fs.readFileSync('ckidsAwtsmoos/exports/NatureExports.js','utf8');
const details = { sourceEmpty: foliage.includes('VillageGrassField: []'), builtEmpty: Array.isArray(village.nivrayim.VillageGrassField) && village.nivrayim.VillageGrassField.length === 0, cacheBust: nature.includes('no-composed-black-grass-20260609-bh556') };
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ ok:false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok:true, details }, null, 2));
