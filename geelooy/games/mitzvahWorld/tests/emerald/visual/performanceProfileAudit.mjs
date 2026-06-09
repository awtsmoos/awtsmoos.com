#!/usr/bin/env node
/**
 * B"H
 * @file performanceProfileAudit.mjs
 * @description Chapter 493: Performance cannot be guaranteed by poetry. This
 * audit verifies actual compile counts for active mobile and ultra-low profiles.
 */
import emerald from '../../../ckidsAwtsmoos/tochen/worlds/emerald.js';
import { compileVillage } from '../../../ckidsAwtsmoos/tochen/worlds/emeraldVillage/villageCompiler.js';
const count = value => value && typeof value === 'object' ? Object.keys(value).length : 0;
const summarize = (name, n) => ({ name, domem: count(n.Domem), trees: count(n.ProceduralTree), buildings: count(n.ProceduralBuilding), roads: count(n.ProceduralRoad), npc: count(n.InteractiveNpc), budgetOk: n.__visualBudget?.ok, density: n.__visualBudget?.density });
const active = summarize('activeMobile', emerald.nivrayim);
const ultra = summarize('ultraLow', compileVillage({ profile: 'ultraLow', seed: 7701 }));
const failures = [];
if (!active.budgetOk || active.domem > 1350 || active.trees > 200) failures.push('active mobile exceeds headroom limits');
if (!ultra.budgetOk || ultra.domem > 900 || ultra.trees > 120 || ultra.buildings > active.buildings || ultra.roads > active.roads) failures.push('ultra-low profile does not reduce load enough');
if (ultra.domem >= active.domem || ultra.trees >= active.trees) failures.push('ultra-low is not lighter than mobile');
const details = { active, ultra, domemSaved: active.domem - ultra.domem, treeSaved: active.trees - ultra.trees };
if (failures.length) { console.error(JSON.stringify({ ok: false, failures, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
