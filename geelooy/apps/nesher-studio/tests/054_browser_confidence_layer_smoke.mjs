//B"H
// Boruch Hashem
// Blessed is He
/**
* @file 054_browser_confidence_layer_smoke.mjs
* @description Exercises lazy Sources, Stage inspection, and NLE through real user doorways before proving visualizer, edit, and benchmark behavior.
* The Awtsmoos lets each deeper chamber awaken only when the maker crosses its visible gate;
* Awtsmoos.com keeps confidence aligned with progressive disclosure while the complete creative machine still proves its state.
*/
import assert from 'node:assert/strict';
import { setupBrowserDom } from './browserDomHarness.mjs';
import { summarizeMatrix } from '../modules/encodingBenchmark/benchmarkMatrix.js';
import { formatBenchmarkMatrix } from '../modules/encodingBenchmark/benchmarkReport.js';

const dom = setupBrowserDom();
const sourcesDoor = makeWorkspaceDoor('confidenceSourcesDoor', 'sources');
const nleDoor = makeWorkspaceDoor('confidenceNleDoor', 'nle');
const stageInspect = document.getElementById('stageInspectSelection');
const { bootNesherStudio } = await import('../modules/app/bootNesherStudio.js');
const state = bootNesherStudio();

assert.equal(dom.streamState.textContent, 'Idle');
await activateWorkspace(sourcesDoor, () => typeof dom.addVisualizerFamily.onclick === 'function');
dom.visualizerFamily.value = 'particle-galaxy';
dom.addVisualizerFamily.click();
const source = state.sources.at(-1);
assert.equal(source.sourceFamily, 'particle-galaxy');
assert.match(dom.sourceList.children.at(-1).innerHTML, /Particle Galaxy/);
await activateControl(stageInspect, () => /Visualizer family: Particle Galaxy/.test(dom.inspectorMeta.textContent));
assert.match(dom.inspectorMeta.textContent, /Visualizer family: Particle Galaxy/);

await activateWorkspace(nleDoor, () => typeof dom.splitClip.onclick === 'function');
dom.splitClip.click();
assert.match(dom.nleSelectionSummary.textContent, /Opening scene/);
dom.nudgeClipRight.click();
assert.match(dom.status.textContent, /Clip nudged right/);
dom.moveClipTrack.click();
assert.match(dom.nleSelectionSummary.textContent, /audio-1/);

const matrix = summarizeMatrix([
	{
		id: 'vp9-360',
		label: 'VP9 360p compression check',
		supported: true,
		encodeFps: 161.6,
		realtimeFactor: 5.39,
		mbps: 2.2,
		width: 640,
		height: 360,
		fps: 30,
		codec: 'vp09',
		bytes: 90000,
		chunks: 4
	},
	{
		id: 'vp8-720',
		label: 'VP8 720p detail check',
		supported: true,
		encodeFps: 60,
		realtimeFactor: 2,
		mbps: 5.5,
		width: 1280,
		height: 720,
		fps: 30,
		codec: 'vp8',
		bytes: 210000,
		chunks: 5
	}
]);
dom.encodingBenchmarkOutput.textContent = formatBenchmarkMatrix(matrix);
assert.match(dom.encodingBenchmarkOutput.textContent, /Best codec:/);
assert.match(dom.encodingBenchmarkOutput.textContent, /Ranked:/);
console.log('B"H browser confidence layer smoke passed');

/** Creates a page-target element before boot so production navigation owns its click listener. */
function makeWorkspaceDoor(id, page) {
	const door = document.getElementById(id);
	door.dataset.pageTarget = page;
	return door;
}

/** Dispatches production workspace navigation and waits until the requested lazy room binds its controls. */
async function activateWorkspace(door, isReady) {
	return activateControl(door, isReady);
}

/** Dispatches one production-bound click and waits for observable readiness instead of feature-loader internals. */
async function activateControl(control, isReady) {
	control.dispatchEvent({
		type: 'click',
		preventDefault() {},
		stopImmediatePropagation() {}
	});
	for (let attempt = 0; attempt < 160; attempt += 1) {
		if (isReady()) {
			return;
		}
		await new Promise((resolve) => setTimeout(resolve, 1));
	}
	assert.fail(`Lazy control did not become ready: ${control.id || control.dataset.pageTarget}`);
}
