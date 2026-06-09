#!/usr/bin/env node
/**
 * B"H
 * @file artDirectionAudit.mjs
 * @description Chapter 452: The uploaded screenshot target is now a measurable
 * contract, not an untracked wish.
 */
import { REFERENCE_SHOT_CHECKLIST } from '../../../ckidsAwtsmoos/tochen/worlds/emeraldVillage/artDirection/referenceShotChecklist.js';
import { DENSITY_TARGETS } from '../../../ckidsAwtsmoos/tochen/worlds/emeraldVillage/artDirection/densityTargets.js';
import { LANDMARK_TARGETS } from '../../../ckidsAwtsmoos/tochen/worlds/emeraldVillage/artDirection/landmarkTargets.js';
const details = { title: REFERENCE_SHOT_CHECKLIST.title, hud: REFERENCE_SHOT_CHECKLIST.hud?.length, world: REFERENCE_SHOT_CHECKLIST.world?.length, maxDomem: DENSITY_TARGETS.maxDomem, landmarks: LANDMARK_TARGETS.length };
if (!details.title?.includes('EMERALD') || details.hud < 5 || details.world < 7 || details.landmarks < 6) { console.error(JSON.stringify({ ok: false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
