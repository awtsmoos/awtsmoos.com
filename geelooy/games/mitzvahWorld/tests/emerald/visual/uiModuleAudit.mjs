#!/usr/bin/env node
/**
 * B"H
 * @file uiModuleAudit.mjs
 * @description Chapter 374: The NPC UI modules should stay split, small, and
 * present. No giant dialogue monolith may return quietly.
 */
import fs from 'node:fs';
import path from 'node:path';
const root = 'ckidsAwtsmoos/Olam/worker/handlers/ui';
const files = fs.readdirSync(root).filter(file => file.endsWith('.js')).sort();
const required = ['npcOverlay.js', 'npcDialogueMarkup.js', 'npcLevelMarkup.js', 'npcStatsMarkup.js', 'npcOverlayActions.js', 'npcCss.js', 'npcCssCards.js', 'levelFetcher.js', 'worldStartDispatcher.js', 'levelIdNormalizer.js'];
const counts = files.map(file => ({ file, lines: fs.readFileSync(path.join(root, file), 'utf8').split(/\r?\n/).length }));
const oversized = counts.filter(item => item.lines > 90);
const missing = required.filter(file => !files.includes(file));
const details = { files: files.length, missing, oversized, maxLines: Math.max(...counts.map(x => x.lines)), counts };
if (missing.length || oversized.length) { console.error(JSON.stringify({ ok: false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
