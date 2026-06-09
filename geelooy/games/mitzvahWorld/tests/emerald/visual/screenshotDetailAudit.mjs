#!/usr/bin/env node
/**
 * B"H
 * @file screenshotDetailAudit.mjs
 * @description Chapter 491: Screenshot-matching details remain live, but now
 * respect mobile density headroom.
 */
import emerald from '../../../ckidsAwtsmoos/tochen/worlds/emerald.js';
const n = emerald.nivrayim, domem = Object.keys(n.Domem || {}), flowers = Object.keys(n.ProceduralFlowerPatch || {});
const details = { pathCenter: domem.filter(k => k.startsWith('entry_path_center_cobble_')).length, flowerClusters: flowers.filter(k => k.startsWith('entry_dense_flower_cluster_')).length, screenshotDetails: n.__visualEnrichment?.screenshotDetails, domem: domem.length };
if (details.pathCenter < 20 || details.flowerClusters < 12 || !details.screenshotDetails || details.domem > 1350) { console.error(JSON.stringify({ ok: false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
