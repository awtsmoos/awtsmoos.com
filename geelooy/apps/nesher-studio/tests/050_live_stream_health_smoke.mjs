import assert from 'node:assert/strict';
import { createLiveStreamHealth, beginLiveHealth, finishLiveHealth, readLiveHealth } from '../modules/live/liveStreamHealth.js';
import { formatBytes, formatFps, formatRate, streamVerdict } from '../modules/live/streamStatsFormat.js';

let now = 1000;
const model = createLiveStreamHealth(() => now);
const start = beginLiveHealth(model, 'abc');
assert.equal(start.state, 'Starting');
now += 1000;
const stream = { sessionId:'abc', state:{ frameIndex:30, segments:[1,2], uploaded:2048, errors:[] } };
const health = readLiveHealth(model, stream, 'Running');
assert.equal(health.verdict, 'healthy');
assert.match(health.summary, /Running/);
assert.equal(formatBytes(2048), '2.0 KB');
assert.equal(formatFps(30, 1000), '30.0 fps');
assert.equal(formatRate(125000), '1.00 Mbps');
assert.equal(streamVerdict({ state:'Failed', errors:1 }), 'needs attention');
assert.equal(finishLiveHealth(model, { sessionId:'abc', frames:30, segments:2, uploaded:2048, errors:[] }).state, 'Stopped');
console.log('B"H live stream health smoke passed');
