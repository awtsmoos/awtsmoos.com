import assert from 'node:assert/strict';
import { setupBrowserDom } from './browserDomHarness.mjs';
import { summarizeMatrix } from '../modules/encodingBenchmark/benchmarkMatrix.js';
import { formatBenchmarkMatrix } from '../modules/encodingBenchmark/benchmarkReport.js';

const dom = setupBrowserDom();
const { bootNesherStudio } = await import('../modules/app/bootNesherStudio.js');
const state = bootNesherStudio();

assert.equal(dom.streamState.textContent, 'Idle');
dom.visualizerFamily.value = 'particle-galaxy';
dom.addVisualizerFamily.click();
const source = state.sources.at(-1);
assert.equal(source.sourceFamily, 'particle-galaxy');
assert.match(dom.sourceList.children.at(-1).innerHTML, /Particle Galaxy/);
assert.match(dom.inspectorMeta.textContent, /Visualizer family: Particle Galaxy/);

dom.splitClip.click();
assert.match(dom.nleSelectionSummary.textContent, /Opening scene/);
dom.nudgeClipRight.click();
assert.match(dom.status.textContent, /Clip nudged right/);
dom.moveClipTrack.click();
assert.match(dom.nleSelectionSummary.textContent, /audio-1/);

const matrix = summarizeMatrix([
  { id:'vp9-360', label:'VP9 360p compression check', supported:true, encodeFps:161.6, realtimeFactor:5.39, mbps:2.2, width:640, height:360, fps:30, codec:'vp09', bytes:90000, chunks:4 },
  { id:'vp8-720', label:'VP8 720p detail check', supported:true, encodeFps:60, realtimeFactor:2, mbps:5.5, width:1280, height:720, fps:30, codec:'vp8', bytes:210000, chunks:5 }
]);
dom.encodingBenchmarkOutput.textContent = formatBenchmarkMatrix(matrix);
assert.match(dom.encodingBenchmarkOutput.textContent, /Best codec:/);
assert.match(dom.encodingBenchmarkOutput.textContent, /Ranked:/);
console.log('B"H browser confidence layer smoke passed');
