#!/usr/bin/env node
/**
 * B"H
 * @file performanceRuntimeAudit.mjs
 * @description Chapter 524: Performance hints must exist in compiled data and
 * be applied by Domem/SolidBlock runtime mesh paths.
 */
import fs from 'node:fs';
import emerald from '../../../ckidsAwtsmoos/tochen/worlds/emerald.js';
const domem = Object.values(emerald.nivrayim.Domem || {});
const tagged = domem.filter(item => item.renderGroup && item.instanceKey && item.cullRadius).length;
const base = fs.readFileSync('ckidsAwtsmoos/chayim/domem/index.js', 'utf8');
const lifecycle = fs.readFileSync('ckidsAwtsmoos/chayim/domem/methods/lifecycle.js', 'utf8');
const solid = fs.readFileSync('ckidsAwtsmoos/dvarim/architecture/SolidBlock.js', 'utf8');
const details = { domem: domem.length, tagged, baseStoresHints: base.includes('renderGroup') && base.includes('applyPerformanceUserData'), lifecycleAppliesHints: lifecycle.includes('applyPerfToTree') && lifecycle.includes('applyPerformanceUserData'), solidAppliesHints: solid.includes('applyPerformanceUserData') };
if (tagged < 1000 || !details.baseStoresHints || !details.lifecycleAppliesHints || !details.solidAppliesHints) { console.error(JSON.stringify({ ok: false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
