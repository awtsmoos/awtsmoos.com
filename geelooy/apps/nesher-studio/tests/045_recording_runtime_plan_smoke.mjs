import assert from 'node:assert/strict';
import { createRecordingRuntimePlan, recordingPlanSummary } from '../modules/recording/session/RecordingRuntimePlan.js';
const scope = { VideoEncoder:function(){}, VideoFrame:function(){}, AudioEncoder:function(){}, AudioData:function(){}, MediaStreamTrackProcessor:function(){}, Worker:function(){}, OffscreenCanvas:function(){} };
const plan = createRecordingRuntimePlan(scope);
assert.equal(plan.mode, 'worker-webcodecs');
assert.match(recordingPlanSummary(plan), /worker-webcodecs/);
console.log('B"H recording runtime plan smoke passed');
