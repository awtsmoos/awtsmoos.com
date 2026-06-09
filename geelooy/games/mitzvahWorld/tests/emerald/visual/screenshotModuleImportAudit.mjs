#!/usr/bin/env node
/**
 * B"H
 * @file screenshotModuleImportAudit.mjs
 * @description Chapter 470: The screenshot-target folders receive their own
 * import-path audit: art direction, entry scene, camera, audio, life, HUD,
 * quest, portrait, and guide-rig modules.
 */
import fs from 'node:fs';
import path from 'node:path';
const roots = [
  'ckidsAwtsmoos/tochen/worlds/emeraldVillage/artDirection',
  'ckidsAwtsmoos/tochen/worlds/emeraldVillage/entryScene',
  'ckidsAwtsmoos/tochen/worlds/emeraldVillage/camera',
  'ckidsAwtsmoos/tochen/worlds/emeraldVillage/audio',
  'ckidsAwtsmoos/tochen/worlds/emeraldVillage/life',
  'ckidsAwtsmoos/Olam/worker/handlers/ui/emeraldHud',
  'ckidsAwtsmoos/Olam/worker/handlers/ui/emeraldQuest',
  'ckidsAwtsmoos/Olam/worker/handlers/ui/npcPortrait',
  'ckidsAwtsmoos/dvarim/npc/guide'
];
const missing = [];
for (const root of roots) {
  for (const file of fs.readdirSync(root).filter(name => name.endsWith('.js'))) {
    const full = path.join(root, file), text = fs.readFileSync(full, 'utf8');
    for (const match of text.matchAll(/from ['"](\.\.?\/[^'"]+)['"]/g)) {
      const target = path.normalize(path.join(root, match[1])), resolved = target.endsWith('.js') ? target : `${target}.js`;
      if (!fs.existsSync(resolved)) missing.push({ file: full, import: match[1], resolved });
    }
  }
}
if (missing.length) { console.error(JSON.stringify({ ok: false, missing }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, roots }, null, 2));
