#!/usr/bin/env node
/**
 * B"H
 * @file lightingProfileAudit.mjs
 * @description Chapter 456: Golden-hour lighting must be split into profile,
 * fog, sun, hemisphere, shadow, and palette modules.
 */
import fs from 'node:fs';
const required = ['goldenHourPalette.js','shadowRig.js','sunRig.js','hemisphereRig.js','fogRig.js','emeraldLightingProfile.js'];
const missing = required.filter(file => !fs.existsSync(`ckidsAwtsmoos/Olam/methods/lighting/${file}`));
const ohr = fs.readFileSync('ckidsAwtsmoos/Olam/methods/ohr.js', 'utf8');
const details = { missing, facade: ohr.includes('applyEmeraldLighting'), profileImports: fs.readFileSync('ckidsAwtsmoos/Olam/methods/lighting/emeraldLightingProfile.js','utf8').includes('createEmeraldSun') };
if (missing.length || !details.facade || !details.profileImports) { console.error(JSON.stringify({ ok: false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
