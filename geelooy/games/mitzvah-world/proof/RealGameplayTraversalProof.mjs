//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RealGameplayTraversalProof.mjs
 * @description Proves physical departure, reversal, deterministic revisit, and bounded Blank Meadow resources.
 * The Awtsmoos renews every footfall while Awtsmoos.com measures the path;
 * no imagined stream is claimed where the bounded meadow exposes no streaming aftermath.
 */

import { fileURLToPath } from 'node:url';
import { startBrowserProof } from '../experiments/Awtsmoos/src/test/browser/BrowserProofProcess.mjs';
import { createCdpProofSession } from './CdpProofSession.mjs';
import { enterSinglePlayer, delay } from './MobileGameplayCdp.mjs';
import { prepareProofCache } from './ProofCachePolicy.mjs';
import { waitForPersistentRuntime } from './StatePersistenceRecoveryCdp.mjs';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const owner = await startBrowserProof(root);
let proof = null;
let failure = null;
try {
	proof = await createCdpProofSession(owner.cdpPort);
	const { command } = proof;
	for (const domain of ['Page', 'Runtime', 'Network', 'Log']) await command(`${domain}.enable`);
	await prepareProofCache(command);
	await command('Emulation.setFocusEmulationEnabled', { enabled: true });
	await command('Emulation.setDeviceMetricsOverride', { deviceScaleFactor: 1, height: 720, mobile: false, width: 1280 });
	await command('Page.navigate', { url: `${owner.baseUrl}/geelooy/games/mitzvahWorld/index.html?traversalProof=${Date.now()}` });
	await command('Page.bringToFront');
	await enterSinglePlayer(command, 'blank-meadow');
	await waitForPersistentRuntime(command);
	await delay(1800);
	const baseline = await checkpoint(command);
	await hold(command, 'w', 'KeyW', 6000);
	const far = await checkpoint(command);
	const firstRevisit = await revisit(command, baseline, 34);
	await hold(command, 'w', 'KeyW', 2800);
	const secondFar = await checkpoint(command);
	const secondRevisit = await revisit(command, baseline, 22);
	const receipt = assess({ baseline, far, firstRevisit, secondFar, secondRevisit, evidence: proof.evidence });
	console.log(`REAL_TRAVERSAL_RECEIPT ${JSON.stringify(receipt)}`);
	if (!receipt.accepted) throw new Error(`REAL_TRAVERSAL_REJECTED ${JSON.stringify(receipt)}`);
} catch (error) {
	failure = error;
	console.error(error?.stack || error);
} finally {
	await proof?.close().catch(() => {});
	await owner.stop().catch(() => {});
}
if (failure) process.exitCode = 1;

async function revisit(command, baseline, pulses) {
	let nearest = await checkpoint(command);
	for (let index = 0; index < pulses; index += 1) {
		await hold(command, 's', 'KeyS', 240);
		const current = await checkpoint(command);
		if (distance(current, baseline) < distance(nearest, baseline)) nearest = current;
		if (distance(nearest, baseline) < 1.25) break;
	}
	return nearest;
}

async function checkpoint(command) {
	return evaluate(command, `(() => { const r=window.AwtsmoosMitzvahWorld?.runtime,info=r?.renderer?.info||{},stats=r?.renderer?.stats||info.render||{}; return {
		world:r?.worldExperience?.id||r?.worldExperience||null,x:r?.state?.x,y:r?.state?.y,z:r?.state?.z,facing:r?.state?.facing,
		frameError:r?.lastFrameError||null,runtimeError:r?.runtimeError||null,stream:r?.chunkRuntime?.diagnostics?.()||null,
		render:{draws:stats.draws??stats.calls??null,meshes:stats.meshes??null,triangles:stats.triangles??null,geometries:info.memory?.geometries??null,textures:info.memory?.textures??null},
		heap:performance.memory?.usedJSHeapSize??null
	}; })()`);
}

async function hold(command, key, code, milliseconds) {
	await command('Input.dispatchKeyEvent', { type: 'keyDown', key, code });
	await delay(milliseconds);
	await command('Input.dispatchKeyEvent', { type: 'keyUp', key, code });
}

function assess(values) {
	const points = [values.baseline, values.far, values.firstRevisit, values.secondFar, values.secondRevisit];
	const away = distance(values.far, values.baseline);
	const awayTwo = distance(values.secondFar, values.baseline);
	const revisitOne = distance(values.firstRevisit, values.baseline);
	const revisitTwo = distance(values.secondRevisit, values.baseline);
	const saneGround = points.every(point => Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z) && point.y > -8 && point.y < 20);
	const cleanRuntime = points.every(point => !point.frameError && !point.runtimeError && point.world === 'blank-meadow');
	const resourcesBounded = boundedResources(values.baseline, values.secondRevisit);
	const streamingPolicy = points.some(point => point.stream) ? 'runtime-exposed' : 'bounded-no-streaming-runtime';
	const evidenceClean = ['consoleErrors', 'loadingFailures', 'networkErrors', 'runtimeExceptions'].every(key => values.evidence[key].length === 0);
	const accepted = away > 5 && awayTwo > 2 && revisitOne < away * 0.45 && revisitTwo < awayTwo * 0.55 && saneGround && cleanRuntime && resourcesBounded && evidenceClean;
	return { ...values, away, awayTwo, revisitOne, revisitTwo, saneGround, cleanRuntime, resourcesBounded, streamingPolicy, evidenceClean, accepted };
}

function boundedResources(first, last) {
	for (const key of ['draws', 'meshes', 'triangles', 'geometries', 'textures']) {
		const a = first.render[key], b = last.render[key];
		if (Number.isFinite(a) && Number.isFinite(b) && b > Math.max(a * 2.25, a + (key === 'triangles' ? 500000 : 128))) return false;
	}
	if (Number.isFinite(first.heap) && Number.isFinite(last.heap) && last.heap > first.heap * 2.5 + 64 * 1024 * 1024) return false;
	return true;
}

function distance(a, b) {
	return Math.hypot(a.x - b.x, a.z - b.z);
}

async function evaluate(command, expression) {
	const result = await command('Runtime.evaluate', { awaitPromise: true, expression, returnByValue: true });
	return result.result.value;
}
