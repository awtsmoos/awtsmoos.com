#!/usr/bin/env node
/**
 * B"H
 * @file entryHudAudit.mjs
 * @description Chapter 453: The screenshot HUD modules must exist and the live
 * Emerald export must carry EntryScene HUD data.
 */
import fs from 'node:fs';
import emerald from '../../../ckidsAwtsmoos/tochen/worlds/emerald.js';
const files = ['areaStatsPanel.js','questPanel.js','playerVitalsPanel.js','bottomIconBar.js','currentNpcPanel.js','titlePanel.js','emeraldHudRenderer.js','emeraldHudCss.js'];
const missing = files.filter(file => !fs.existsSync(`ckidsAwtsmoos/Olam/worker/handlers/ui/emeraldHud/${file}`));
const scene = emerald.nivrayim.EntryScene;
const details = { missing, title: scene?.manifest?.title, hudIcons: scene?.hud?.bottomIcons?.length, flags: emerald.nivrayim.__entryScene };
if (missing.length || details.title !== 'EMERALD VILLAGE' || details.hudIcons < 5 || !details.flags?.screenshotTarget) { console.error(JSON.stringify({ ok: false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
