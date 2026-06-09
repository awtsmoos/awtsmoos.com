#!/usr/bin/env node
/**
 * B"H
 * @file compilerModuleAudit.mjs
 * @description Chapter 365: The Emerald compiler must remain a conductor with
 * small helper vessels, not return to monolith.
 */
import fs from 'node:fs';
import path from 'node:path';
const root = 'ckidsAwtsmoos/tochen/worlds/emeraldVillage/compiler';
const files = fs.readdirSync(root).filter(file => file.endsWith('.js')).sort();
const counts = files.map(file => ({ file, lines: fs.readFileSync(path.join(root, file), 'utf8').split(/\r?\n/).length }));
const compilerLines = fs.readFileSync('ckidsAwtsmoos/tochen/worlds/emeraldVillage/villageCompiler.js', 'utf8').split(/\r?\n/).length;
const required = ['profiles.js', 'random.js', 'buckets.js', 'roads.js', 'buildings.js', 'wanderers.js', 'wildTrees.js', 'mazikim.js', 'terrain.js', 'skyVehiclesObjectives.js', 'summary.js'];
const missing = required.filter(file => !files.includes(file));
const oversized = counts.filter(item => item.lines > 40);
const details = { compilerLines, files: files.length, missing, oversized, counts };
if (missing.length || oversized.length || compilerLines > 60) { console.error(JSON.stringify({ ok: false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
