#!/usr/bin/env node
/**
 * B"H
 * @file entryTextContractAudit.mjs
 * @description Chapter 378: The original entry point must speak plainly: talk
 * to the guide, choose lava levels, and begin Aleph Lava Crossing.
 */
import { CENTRAL_LEVEL_GUIDE } from '../../../ckidsAwtsmoos/tochen/worlds/emeraldVillage/levelGuideManifest.js';
import { ENTRY_OBJECTIVES } from '../../../ckidsAwtsmoos/tochen/worlds/emeraldVillage/entryObjectiveManifest.js';
const guideText = [CENTRAL_LEVEL_GUIDE.name, ...(CENTRAL_LEVEL_GUIDE.dialogues || []), CENTRAL_LEVEL_GUIDE.areaNote || ''].join(' ');
const objectiveText = ENTRY_OBJECTIVES.map(o => `${o.title} ${o.text}`).join(' ');
const details = {
  guideMentionsLava: /lava/i.test(guideText),
  guideMentionsLevels: /level/i.test(guideText),
  guideMentionsLadder: /ladder/i.test(guideText),
  objectivesMentionGuide: /guide/i.test(objectiveText),
  objectivesMentionLava: /lava|ladder-1|Aleph/i.test(objectiveText),
  objectiveCount: ENTRY_OBJECTIVES.length
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ ok: false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
