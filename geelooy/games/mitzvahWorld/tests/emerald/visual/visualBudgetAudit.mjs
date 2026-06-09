#!/usr/bin/env node
/**
 * B"H
 * @file visualBudgetAudit.mjs
 * @description Chapter 494: The visual budget audit now respects mobile
 * density. It checks richness and headroom instead of demanding every optional
 * accent on every device.
 */
import emerald from '../../../ckidsAwtsmoos/tochen/worlds/emerald.js';
const n = emerald.nivrayim;
const fail = (message, details = {}) => { console.error(JSON.stringify({ ok: false, message, details }, null, 2)); process.exit(1); };
const count = value => value && typeof value === 'object' ? Object.keys(value).length : 0;
const budget = n.__visualBudget;
const visual = n.__emeraldCompileSummary?.visualBudget || budget;
const details = {
  trees: count(n.ProceduralTree),
  domem: count(n.Domem),
  accents: Object.keys(n.Domem || {}).filter(k => k.startsWith('district_accent_')).length,
  fireflies: Object.keys(n.Domem || {}).filter(k => k.startsWith('etz_firefly_')).length,
  mountains: Object.keys(n.Domem || {}).filter(k => k.startsWith('distant_mountain_')).length,
  density: budget?.density,
  budget,
  visual
};
if (!budget?.ok) fail('Visual budget failed', details);
if (details.trees > 200) fail('Too many mobile trees', details);
if (details.domem < 1000 || details.domem > 1350) fail('Domem visual density outside mobile headroom band', details);
if (details.accents < 24) fail('District accent manifest rendered too few mobile accents', details);
if (details.fireflies < 24) fail('Etz Chayim sparkle layer too thin for mobile density', details);
if (details.mountains < 8) fail('Distant vista layer too thin', details);
console.log(JSON.stringify({ ok: true, details }, null, 2));
