#!/usr/bin/env node
/**
 * B"H
 * @file visualModuleHygieneAudit.mjs
 * @description Chapter 244: The Awtsmoos refuses decorative code duplication.
 * Accent modules must remain data-driven, not thirty-five cloned files.
 */
import fs from 'node:fs';
import path from 'node:path';
const root = 'ckidsAwtsmoos/tochen/worlds/emeraldVillage/visualPasses';
const files = fs.readdirSync(root).filter(file => file.endsWith('.js')).sort();
const accentClones = files.filter(file => /^districtAccent\d+\.js$/.test(file));
const lineCounts = Object.fromEntries(files.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8').split(/\r?\n/).length]));
const oversized = Object.entries(lineCounts).filter(([, lines]) => lines > 80);
const required = ['shapeKit.js', 'palette.js', 'districtAccentData.js', 'districtAccents.js', 'visualBudgetValidator.js', 'visualIndex.js'];
const missing = required.filter(file => !files.includes(file));
const fail = (message, details) => { console.error(JSON.stringify({ ok: false, message, details }, null, 2)); process.exit(1); };
const details = { files: files.length, accentClones, oversized, missing, lineCounts };
if (accentClones.length) fail('Generated district accent clone files must not remain', details);
if (missing.length) fail('Required visual registry modules missing', details);
if (oversized.length) fail('Visual pass files must remain small', details);
console.log(JSON.stringify({ ok: true, details }, null, 2));
