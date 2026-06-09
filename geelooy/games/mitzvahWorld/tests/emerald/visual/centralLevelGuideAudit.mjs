#!/usr/bin/env node
/**
 * B"H
 * @file centralLevelGuideAudit.mjs
 * @description Chapter 253: The entry guide is tested like a gatekeeper. He
 * must stand at the plaza, carry stats, and point clearly to lava ladder levels.
 */
import emerald from '../../../ckidsAwtsmoos/tochen/worlds/emerald.js';
import { LevelDataMap } from '../../../ckidsAwtsmoos/Olam/uiManager/ui/screens/levelSelect/LevelDataMap.js';
const n = emerald.nivrayim;
const guide = n.InteractiveNpc?.central_level_guide;
const fail = (message, details) => { console.error(JSON.stringify({ ok: false, message, details }, null, 2)); process.exit(1); };
const ladderLevels = LevelDataMap.filter(level => /^ladder-\d+\.json$/.test(level.id));
const distance = guide?.position ? Math.hypot(guide.position.x, guide.position.z) : Infinity;
const details = {
  exists: Boolean(guide),
  name: guide?.name,
  position: guide?.position,
  distanceFromSpawnXZ: distance,
  hasLevelSelect: guide?.hasLevelSelect,
  markerType: guide?.markerType,
  hasStats: Boolean(guide?.areaStats && Object.keys(guide.areaStats).length >= 5),
  dialogueMentionsLava: Boolean((guide?.dialogues || []).join(' ').match(/lava|ladder|levels/i)),
  hasShop: guide?.hasShop,
  shopItems: guide?.shopInventory?.length || 0,
  levelCards: LevelDataMap.length,
  ladderLevels: ladderLevels.length,
  firstLava: LevelDataMap.find(level => level.id === 'ladder-1.json')
};
if (!guide) fail('Central level guide missing', details);
if (guide.name !== 'Mitzvah Level Guide') fail('Central guide has wrong name', details);
if (distance > 8) fail('Central guide is not near entry spawn/plaza', details);
if (guide.markerType !== 'levels' || guide.hasLevelSelect !== true) fail('Central guide is not explicitly marked for level select', details);
if (!details.hasStats || !details.dialogueMentionsLava) fail('Central guide lacks stats or lava/level dialogue', details);
if (details.ladderLevels !== 20 || !details.firstLava?.title?.match(/Aleph Lava Crossing/)) fail('Lava ladder level cards are incomplete', details);
console.log(JSON.stringify({ ok: true, details }, null, 2));
