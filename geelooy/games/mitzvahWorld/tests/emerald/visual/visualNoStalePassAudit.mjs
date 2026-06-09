#!/usr/bin/env node
/**
 * B"H
 * @file visualNoStalePassAudit.mjs
 * @description Chapter 246: Old duplicate visual gates may not haunt the new
 * registry. The Awtsmoos keeps one clear path into the Emerald beauty pass.
 */
import fs from 'node:fs';
const stale = ['ckidsAwtsmoos/tochen/worlds/emeraldVillage/EmeraldMicroProps.js', 'ckidsAwtsmoos/tochen/worlds/emeraldVillage/EmeraldArchitecturePass.js'];
const present = stale.filter(file => fs.existsSync(file));
if (present.length) { console.error(JSON.stringify({ ok: false, present }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, removedStalePasses: stale }, null, 2));
