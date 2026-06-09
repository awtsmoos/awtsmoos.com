#!/usr/bin/env node
/**
 * B"H
 * @file screenshotNoPlaceholderAudit.mjs
 * @description Chapter 471: Screenshot-target folders may not contain TODOs,
 * stubs, or placeholder language.
 */
import fs from 'node:fs';
import path from 'node:path';
const roots = ['ckidsAwtsmoos/tochen/worlds/emeraldVillage/artDirection','ckidsAwtsmoos/tochen/worlds/emeraldVillage/entryScene','ckidsAwtsmoos/tochen/worlds/emeraldVillage/camera','ckidsAwtsmoos/tochen/worlds/emeraldVillage/audio','ckidsAwtsmoos/tochen/worlds/emeraldVillage/life','ckidsAwtsmoos/Olam/worker/handlers/ui/emeraldHud','ckidsAwtsmoos/Olam/worker/handlers/ui/emeraldQuest','ckidsAwtsmoos/Olam/worker/handlers/ui/npcPortrait','ckidsAwtsmoos/dvarim/npc/guide'];
const banned = /TODO|FIXME|placeholder|stub|implement later/i, hits = [];
for (const root of roots) for (const file of fs.readdirSync(root).filter(name => name.endsWith('.js'))) fs.readFileSync(path.join(root, file), 'utf8').split(/\r?\n/).forEach((line, index) => { if (banned.test(line)) hits.push({ file: path.join(root, file), line: index + 1, text: line.trim() }); });
if (hits.length) { console.error(JSON.stringify({ ok: false, hits }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, roots }, null, 2));
