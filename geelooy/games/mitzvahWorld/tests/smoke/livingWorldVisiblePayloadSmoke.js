// B"H
import assert from 'node:assert/strict';
import { resetLivingWorldState } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldState.js';
import { createLivingWorldRuntime } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldRuntime.js';
import { createLivingWorldVisiblePayload } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldVisibleBridge.js';
resetLivingWorldState();
const rt=createLivingWorldRuntime(globalThis).start('visible-smoke');
rt.step('visible-smoke',8);
const payload=createLivingWorldVisiblePayload(rt);
assert.ok(payload.ambientFeed.events.length>0,'ambient feed visible');
assert.ok(payload.questTracker.active.length>0,'quest tracker visible');
assert.ok(payload.questMarkers.markers.length>0,'map markers visible');
assert.ok(payload.serviceMenu.rows.length>=3,'service rows visible');
assert.ok(payload.reputationSummary,'reputation visible');
assert.ok(payload.economySummary.bread>=0,'economy visible');
console.log('livingWorldVisiblePayloadSmoke passed');
