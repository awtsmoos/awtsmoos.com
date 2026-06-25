// B"H
import assert from 'node:assert/strict';
import { resetLivingWorldState } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldState.js';
import { createLivingWorldRuntime } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldRuntime.js';
resetLivingWorldState();
const rt=createLivingWorldRuntime(globalThis).start('loop');
for(const hour of [6,8,11,15,19]) rt.step('loop',hour);
assert.ok(rt.store.rumors.some(r=>r.currentText.includes('Miriam')||r.currentText.includes('bakery')||r.currentText.includes('blessing')),'rumor mutates through spread');
assert.ok(rt.store.craftedItems.length>0,'profession output created');
assert.ok(rt.store.uiPayloads.scheduleDebugPayload,'schedule debug payload exists');
console.log('starterZoneGameplayLoopSmoke passed');
