#!/usr/bin/env node
/**
 * B"H
 * @file guideRuntimeVisualAudit.mjs
 * @description Chapter 523: The central guide's visualRig must be consumed by
 * actual InteractiveNpc runtime visual modules.
 */
import fs from 'node:fs';
const npc = fs.readFileSync('ckidsAwtsmoos/dvarim/npc/InteractiveNpc.js', 'utf8');
const factory = fs.readFileSync('ckidsAwtsmoos/dvarim/npc/guide/runtime/GuideVisualFactory.js', 'utf8');
const face = fs.readFileSync('ckidsAwtsmoos/dvarim/npc/guide/runtime/GuideVisualFace.js', 'utf8');
const body = fs.readFileSync('ckidsAwtsmoos/dvarim/npc/guide/runtime/GuideVisualBody.js', 'utf8');
const details = {
  npcImportsFactory: npc.includes('buildGuideVisualFromRig'),
  npcPassesVisualRig: npc.includes('this.visualRig') && npc.includes('buildGuideVisualFromRig(this.visualRig)'),
  factoryBuildsGroup: factory.includes('visualRigConsumed') && factory.includes('buildGuideBody') && factory.includes('buildGuideFace'),
  faceUsesRig: face.includes('rig?.face?.eyes') && face.includes('rig?.face?.yarmulke'),
  bodyUsesRig: body.includes("color(rig, 'robe'") && body.includes("color(rig, 'vest'")
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ ok: false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
