import assert from 'node:assert/strict';
import { createGenericHlsController } from '../modules/app/genericHlsController.js';

let now = 1000, intervals = 0, cleared = 0;
const statuses = [];
const health = [];
const vessel = {
  dom:{ stage:{}, fmp4StreamButton:{ textContent:'Start Generic HLS' } },
  state:{ fps:30, width:640, height:360, providerId:'generic-hls' },
  drawStage(){}, tunnelBase:'mock://hls',
  setStatus:text => statuses.push(text),
  setStreamHealth:snapshot => health.push(snapshot)
};
const stream = fakeStream();
const controller = createGenericHlsController(vessel, {
  clock:() => now,
  createStreamer:async options => { assert.equal(options.fps, 30); return stream; },
  setInterval:fn => { intervals += 1; return intervals; },
  clearInterval:id => { if (id) cleared += 1; }
});
const running = await controller.start();
assert.equal(vessel.dom.fmp4StreamButton.textContent, 'Stop Generic HLS');
assert.equal(running.state, 'Running');
assert.equal(running.verdict, 'healthy');
assert.match(running.summary, /Running/);
now += 1000;
const stopped = await controller.stop();
assert.equal(stopped.state, 'Stopped');
assert.equal(vessel.dom.fmp4StreamButton.textContent, 'Start Generic HLS');
assert.ok(cleared >= 2);
assert.match(statuses.at(-1), /Generic HLS stopped/);
const idleStop = await controller.stop();
assert.equal(idleStop.state, 'Stopped');
const failed = await createGenericHlsController(vessel, failOptions()).start();
assert.equal(failed.state, 'Failed');
assert.match(failed.summary, /mock failure/);
console.log('B"H mocked generic HLS controller smoke passed');

function fakeStream() {
  return { sessionId:'mock-session', state:{ frameIndex:0, segments:[], uploaded:0, errors:[] }, async addFrame() { this.state.frameIndex += 30; this.state.segments.push({ id:this.state.segments.length }); this.state.uploaded += 2048; }, async stop() { return { sessionId:this.sessionId, frames:this.state.frameIndex, segments:this.state.segments.length, uploaded:this.state.uploaded, errors:this.state.errors }; } };
}
function failOptions() {
  return { clock:() => now, createStreamer:async () => { throw new Error('mock failure'); }, setInterval:() => 1, clearInterval:() => {} };
}
