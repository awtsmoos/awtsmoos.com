#!/usr/bin/env node
/** B"H @file uiClickSealAudit.mjs @description Chapter 568: NPC overlay buttons must work while non-button UI blocks world clicks. */
import fs from 'node:fs';
const dom = fs.readFileSync('ckidsAwtsmoos/Olam/worker/handlers/ui/domEvents.js','utf8');
const yichud = fs.readFileSync('ckidsAwtsmoos/Olam/interaction/Yichud.js','utf8');
const dialogue = fs.readFileSync('ckidsAwtsmoos/Olam/worker/handlers/ui/npcDialogueMarkup.js','utf8');
const details = {
  sealAttr: dom.includes('data-awts-ui-seal'),
  controlsBypassRootSeal: dom.includes('if (isControl(event.target)) return'),
  bindPressHardSealsButtons: dom.includes('hardSeal(event)') && dom.includes('addEventListener(type, run, false)'),
  yichudBlocker: yichud.includes('[data-awts-ui-seal]') && yichud.includes('blockWorld(event)'),
  travelButtonExists: dialogue.includes('data-npc-travel')
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ ok:false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok:true, details }, null, 2));
