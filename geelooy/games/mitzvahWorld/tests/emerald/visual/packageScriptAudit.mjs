#!/usr/bin/env node
/**
 * B"H
 * @file packageScriptAudit.mjs
 * @description Chapter 457: The npm visual test chain must include every gate
 * that guards the screenshot-targeted Emerald entry.
 */
import fs from 'node:fs';
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const script = pkg.scripts?.['test:emerald:visual'] || '';
const parts = script.split('&&').map(part => part.trim()).filter(Boolean);
const duplicates = parts.filter((part, index) => parts.indexOf(part) !== index);
const required = [
  'packageScriptAudit.mjs','activeExportAudit.mjs','uiModuleAudit.mjs','importPathAudit.mjs','noVisualTodoAudit.mjs','entryTextContractAudit.mjs','worldCountContractAudit.mjs',
  'visualBudgetAudit.mjs','visualModuleHygieneAudit.mjs','visualSmallFilesAudit.mjs','visualTargetAudit.mjs','visualNoStalePassAudit.mjs','centralLevelGuideAudit.mjs','npcLevelUiAudit.mjs','entryObjectiveAudit.mjs','lightingPropAudit.mjs','compilerModuleAudit.mjs',
  'artDirectionAudit.mjs','entryHudAudit.mjs','guideHumanRigAudit.mjs','screenshotDetailAudit.mjs','lightingProfileAudit.mjs','entryCameraAudioLifeAudit.mjs','screenshotModuleImportAudit.mjs','screenshotNoPlaceholderAudit.mjs','performanceProfileAudit.mjs','performanceRuntimeAudit.mjs','guideRuntimeVisualAudit.mjs','runtimeHookAudit.mjs'
];
const missing = required.filter(name => !script.includes(name));
const details = { count: parts.length, duplicates, missing };
if (duplicates.length || missing.length) { console.error(JSON.stringify({ ok: false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
