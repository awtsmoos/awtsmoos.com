#!/usr/bin/env node
/**
 * B"H
 * @file visualSmallFilesAudit.mjs
 * @description Chapter 343: The file-size covenant is tested directly. Visual
 * pass modules should stay small enough to reason about in one breath.
 */
import fs from 'node:fs';
import path from 'node:path';
const root = 'ckidsAwtsmoos/tochen/worlds/emeraldVillage/visualPasses';
const files = fs.readdirSync(root).filter(file => file.endsWith('.js')).sort();
const counts = files.map(file => ({ file, lines: fs.readFileSync(path.join(root, file), 'utf8').split(/\r?\n/).length }));
const oversized = counts.filter(item => item.lines > 40);
if (oversized.length) { console.error(JSON.stringify({ ok: false, oversized }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, files: files.length, maxLines: Math.max(...counts.map(x => x.lines)), counts }, null, 2));
