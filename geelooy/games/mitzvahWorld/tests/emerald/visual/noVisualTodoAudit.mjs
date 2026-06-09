#!/usr/bin/env node
/**
 * B"H
 * @file noVisualTodoAudit.mjs
 * @description Chapter 377: The new Emerald visual and compiler vessels may
 * not hide TODO placeholders or vague fake work.
 */
import fs from 'node:fs';
import path from 'node:path';
const roots = ['ckidsAwtsmoos/tochen/worlds/emeraldVillage/visualPasses', 'ckidsAwtsmoos/tochen/worlds/emeraldVillage/compiler', 'ckidsAwtsmoos/Olam/worker/handlers/ui'];
const banned = /TODO|FIXME|placeholder|stub|implement later/i;
const hits = [];
for (const root of roots) {
  for (const file of fs.readdirSync(root).filter(name => name.endsWith('.js'))) {
    const full = path.join(root, file);
    const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => { if (banned.test(line)) hits.push({ file: full, line: index + 1, text: line.trim() }); });
  }
}
if (hits.length) { console.error(JSON.stringify({ ok: false, hits }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, checkedRoots: roots }, null, 2));
