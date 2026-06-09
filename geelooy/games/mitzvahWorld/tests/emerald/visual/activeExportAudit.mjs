#!/usr/bin/env node
/**
 * B"H
 * @file activeExportAudit.mjs
 * @description Chapter 373: The active emerald.js export must expose the
 * ledgers and first-objective data that the compiler created.
 */
import emerald from '../../../ckidsAwtsmoos/tochen/worlds/emerald.js';
const n = emerald.nivrayim || {};
const details = {
  hasBudget: Boolean(n.__visualBudget?.ok),
  hasSummary: Boolean(n.__emeraldCompileSummary?.centralLevelGuide),
  hasVisualFlags: Boolean(n.__visualEnrichment?.objectives && n.__visualEnrichment?.levelGuideMarker),
  hasTutorialObjective: Array.isArray(n.TutorialObjective?.entry_objectives),
  hasCentralGuide: Boolean(n.InteractiveNpc?.central_level_guide?.hasLevelSelect)
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ ok: false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
