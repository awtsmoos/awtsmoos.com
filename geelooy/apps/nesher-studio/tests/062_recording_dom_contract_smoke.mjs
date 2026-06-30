import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
const required = ['recordButton','recordingProfile','recordPhase','recordElapsed','recordFrames','recordErrors','recordNote','nleJumpStart','nlePlayheadBack','nlePlayheadForward','nleJumpEnd','nleZoomOut','nleZoomIn','runSmokeEncodingBenchmark'];
const missing = required.filter(id => !ids.has(id));

assert.deepEqual(missing, []);
console.log('B"H recording DOM contract smoke passed');
