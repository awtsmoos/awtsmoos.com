import assert from 'node:assert/strict';
import { createTimeline, addClip, selectClip } from '../modules/nle/timeline.js';
const timeline = createTimeline();
const clip = addClip(timeline, { name:'Trim me', start:5, duration:3 });
selectClip(timeline, clip.id);
assert.equal(timeline.selectedClipId, clip.id);
assert.ok(timeline.duration >= 10);
console.log('B"H timeline model smoke passed');
