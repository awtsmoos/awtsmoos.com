// B"H
import assert from 'node:assert/strict';
import { resetLivingWorldState } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldState.js';
import { createLivingWorldRuntime } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldRuntime.js';
resetLivingWorldState();
const scope={ __MITZVAH_WORLD_REALISM_BUDGET__:{maxTasksPerTick:3} };
const rt=createLivingWorldRuntime(scope).start('smoke');
const step=rt.step('smoke',8);
assert.ok(step.schedule.length>0,'schedule rows exist');
assert.ok(rt.store.movementIntents.length>0,'movement intents exist');
assert.ok(rt.store.npcMemories.miriam_baker.length>0,'Miriam remembers player-world actions');
assert.ok(rt.store.rumors.length>0,'rumor created');
assert.ok(Object.keys(rt.store.activeMissions).length>0,'state-born mission accepted');
assert.ok(rt.store.uiPayloads.ambientEventFeedPayload.length>0,'ambient UI feed exists');
console.log('actualGameplayLivingWorldSmoke passed');
