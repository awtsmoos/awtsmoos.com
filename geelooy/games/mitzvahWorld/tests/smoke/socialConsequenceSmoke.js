// B"H
import assert from 'node:assert/strict';
import { createNpcMemoryRuntime } from '../../ckidsAwtsmoos/systems/npc/NpcMemoryRuntime.js';
import { resetLivingWorldState } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldState.js';

const store=resetLivingWorldState();
const memory=createNpcMemoryRuntime(store);
memory.remember('miriam_baker',{kind:'helped',text:'Player helped Miriam.'});
memory.remember('miriam_baker',{kind:'gave_tzedakah',text:'Player gave tzedakah.'});
assert.ok(memory.effects('miriam_baker').trust>=5);
assert.equal(memory.effects('miriam_baker').greetingTone,'warm');
assert.ok(store.familyTrust.tova_child > 0, 'family member sees kindness ripple');
assert.ok((store.socialConsequences||[]).length > 0, 'social consequence rows recorded');
console.log('socialConsequenceSmoke passed');
