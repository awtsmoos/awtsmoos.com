#!/usr/bin/env node
/**
 * B"H
 * @file entryObjectiveAudit.mjs
 * @description Chapter 312: The entry point must not be silent. This audit
 * proves the player receives an objective chain from spawn to the guide to lava.
 */
import emerald from '../../../ckidsAwtsmoos/tochen/worlds/emerald.js';
const n = emerald.nivrayim;
const objectives = n.TutorialObjective?.entry_objectives || [];
const domem = n.Domem || {};
const fail = (message, details) => { console.error(JSON.stringify({ ok: false, message, details }, null, 2)); process.exit(1); };
const details = {
  objectives: objectives.map(o => o.id),
  hasArrive: objectives.some(o => o.id === 'arrive_at_plaza'),
  hasTalk: objectives.some(o => o.id === 'talk_to_level_guide'),
  hasChoose: objectives.some(o => o.id === 'choose_lava_level'),
  markers: Object.keys(domem).filter(k => k.startsWith('objective_'))
};
if (objectives.length !== 3 || !details.hasArrive || !details.hasTalk || !details.hasChoose) fail('Entry objective chain incomplete', details);
if (details.markers.length !== 3) fail('Entry objective visual markers incomplete', details);
console.log(JSON.stringify({ ok: true, details }, null, 2));
