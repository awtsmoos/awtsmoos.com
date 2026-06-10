#!/usr/bin/env node
/** B"H @file villageTravelNpcAudit.mjs @description Chapter 559: start village and egg village must have two-way travel NPCs. */
import fs from 'node:fs';
const village = JSON.parse(fs.readFileSync('levels/ladder/data/village.json','utf8'));
const egg = JSON.parse(fs.readFileSync('levels/ladder/data/egg-village.json','utf8'));
const dialogue = fs.readFileSync('ckidsAwtsmoos/Olam/worker/handlers/ui/npcDialogueMarkup.js','utf8');
const actions = fs.readFileSync('ckidsAwtsmoos/Olam/worker/handlers/ui/npcOverlayActions.js','utf8');
const details = { startNpc: Boolean(village.nivrayim.InteractiveNpc.find(n => n.travelPath === 'egg-village.json')), returnNpc: Boolean(egg.nivrayim.InteractiveNpc.find(n => n.travelPath === 'village.json')), buttonMarkup: dialogue.includes('data-npc-travel'), actionBinding: actions.includes('[data-npc-travel]') && actions.includes('launchLevel(manager, data.travelPath)') };
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ ok:false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok:true, details }, null, 2));
