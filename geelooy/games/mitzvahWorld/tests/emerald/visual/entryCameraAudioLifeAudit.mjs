#!/usr/bin/env node
/**
 * B"H
 * @file entryCameraAudioLifeAudit.mjs
 * @description Chapter 469: Camera, audio, and ambient-life promises must be
 * carried by the live Emerald entry export.
 */
import emerald from '../../../ckidsAwtsmoos/tochen/worlds/emerald.js';
const scene = emerald.nivrayim.EntryScene || {}, life = emerald.nivrayim.AmbientLife?.emerald_entry_life || {};
const details = {
  revealCamera: Boolean(scene.camera?.reveal?.position && scene.camera?.reveal?.lookAt),
  guideCamera: Boolean(scene.camera?.guideFocus?.lookAt),
  treeCamera: Boolean(scene.camera?.treeFocus?.lookAt),
  audioEntryLayers: scene.audio?.entry?.layers?.length || 0,
  audioWater: Boolean(scene.audio?.water?.layers?.includes('emerald_waterfall_and_brook')),
  birds: life.birds || 0,
  butterflies: life.butterflies || 0,
  flags: emerald.nivrayim.__entryScene
};
if (!details.revealCamera || !details.guideCamera || !details.treeCamera || details.audioEntryLayers < 3 || !details.audioWater || details.birds < 10 || details.butterflies < 20 || !details.flags?.camera || !details.flags?.audio) {
  console.error(JSON.stringify({ ok: false, details }, null, 2)); process.exit(1);
}
console.log(JSON.stringify({ ok: true, details }, null, 2));
