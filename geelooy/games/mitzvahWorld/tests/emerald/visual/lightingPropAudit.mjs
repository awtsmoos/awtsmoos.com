#!/usr/bin/env node
/**
 * B"H
 * @file lightingPropAudit.mjs
 * @description Chapter 348: The visual lamp network must stay present around
 * the plaza and central guide.
 */
import emerald from '../../../ckidsAwtsmoos/tochen/worlds/emerald.js';
const keys = Object.keys(emerald.nivrayim.Domem || {});
const count = prefix => keys.filter(k => k.startsWith(prefix)).length;
const details = { entryLampParts: count('entry_lamp_'), plazaLampParts: count('plaza_ring_lamp_'), guideHalo: Boolean(emerald.nivrayim.Domem.central_level_guide_halo) };
if (details.entryLampParts < 8 || details.plazaLampParts < 24 || !details.guideHalo) { console.error(JSON.stringify({ ok: false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
