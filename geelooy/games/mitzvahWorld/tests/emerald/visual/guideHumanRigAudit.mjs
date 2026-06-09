#!/usr/bin/env node
/**
 * B"H
 * @file guideHumanRigAudit.mjs
 * @description Chapter 454: The central guide must carry real procedural-core
 * rig metadata, not only a primitive NPC shell.
 */
import emerald from '../../../ckidsAwtsmoos/tochen/worlds/emerald.js';
const rig = emerald.nivrayim.InteractiveNpc?.central_level_guide?.visualRig;
const details = { kind: rig?.kind, human: rig?.human?.generator, eyes: rig?.face?.eyes?.generator, yarmulke: rig?.face?.yarmulke?.generator, clothing: rig?.clothing?.length, animation: rig?.animation };
if (details.kind !== 'procedural-core-human' || details.human !== 'createRiggedHuman' || details.eyes !== 'createLivingEye' || details.yarmulke !== 'createYarmulke' || details.clothing < 3 || !details.animation?.lookAtPlayer) { console.error(JSON.stringify({ ok: false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
