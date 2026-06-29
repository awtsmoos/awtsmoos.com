// B"H
import assert from 'node:assert/strict';
import { resetLivingWorldState } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldState.js';
import { createLivingWorldRuntime } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldRuntime.js';
resetLivingWorldState();
const rt=createLivingWorldRuntime(globalThis).start('runtime-smoke');
rt.step('first',11); rt.step('second',19);
const talk=rt.speakToNpc('miriam_baker');
assert.match(talk.greeting,/Miriam/);
assert.ok(rt.snapshot().uiPayloads.questTrackerRows.length>=1,'quest tracker payload rows');
assert.ok(rt.snapshot().uiPayloads.reputationSummaryPayload.village>=1,'reputation changes');
console.log('livingWorldRuntimeGameplaySmoke passed');
