#!/usr/bin/env node
/**
 * B"H
 * @file worldCountContractAudit.mjs
 * @description Chapter 490: The live Emerald entry must stay rich enough and
 * far enough from the mobile ceiling to leave runtime headroom.
 */
import emerald from '../../../ckidsAwtsmoos/tochen/worlds/emerald.js';
const n = emerald.nivrayim || {};
const count = value => value && typeof value === 'object' ? Object.keys(value).length : 0;
const details = { buildings: count(n.ProceduralBuilding), roads: count(n.ProceduralRoad), npc: count(n.InteractiveNpc), trees: count(n.ProceduralTree), domem: count(n.Domem), mazikim: count(n.Mazik), terrain: count(n.ProceduralTerrain), objectives: n.TutorialObjective?.entry_objectives?.length || 0, budget: n.__visualBudget };
const failures = [];
if (details.buildings < 40) failures.push('buildings below 40');
if (details.roads < 80) failures.push('roads below 80');
if (details.npc < 25) failures.push('npc below 25');
if (details.trees < 140 || details.trees > 200) failures.push('trees outside 140..200');
if (details.domem < 1150 || details.domem > 1350) failures.push('mobile domem outside 1150..1350 headroom band');
if (details.objectives !== 3) failures.push('entry objective chain missing');
if (!details.budget?.ok) failures.push('visual budget failed');
if (failures.length) { console.error(JSON.stringify({ ok: false, failures, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
