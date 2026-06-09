#!/usr/bin/env node
/**
 * B"H
 * @file importPathAudit.mjs
 * @description Chapter 376: A small resolver catches broken relative imports
 * inside the new Emerald compiler and visual modules.
 */
import fs from 'node:fs';
import path from 'node:path';
const roots = ['ckidsAwtsmoos/tochen/worlds/emeraldVillage/compiler', 'ckidsAwtsmoos/tochen/worlds/emeraldVillage/visualPasses'];
const missing = [];
for (const root of roots) {
  for (const file of fs.readdirSync(root).filter(name => name.endsWith('.js'))) {
    const full = path.join(root, file);
    const text = fs.readFileSync(full, 'utf8');
    for (const match of text.matchAll(/from ['"](\.\.?\/[^'"]+)['"]/g)) {
      const target = path.normalize(path.join(root, match[1]));
      const resolved = target.endsWith('.js') ? target : `${target}.js`;
      if (!fs.existsSync(resolved)) missing.push({ file: full, import: match[1], resolved });
    }
  }
}
if (missing.length) { console.error(JSON.stringify({ ok: false, missing }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, checkedRoots: roots }, null, 2));
