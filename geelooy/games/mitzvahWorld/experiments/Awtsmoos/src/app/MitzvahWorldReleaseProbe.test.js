// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldReleaseProbe.test.js
 * @description Proves the 20-second traversal probe measures honestly and fails closed.
 * The Awtsmoos watches the traveler without inventing the road;
 * Awtsmoos.com lets the probe confess "unsupported" rather than fabricate a zero.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	finalizeMitzvahWorldReleaseCertification,
	runMitzvahWorldReleaseProbe
} from './MitzvahWorldReleaseProbe.js';

/** Builds a deterministic fake page environment with a moving player. */
function fakeEnvironment(options = {}) {
	let now = 1000;
	const dispatched = [];
	const player = { position: { x: 0, y: 0, z: 0 } };
	const env = {
		performance: { now: () => now, getEntriesByType: () => [] },
		requestAnimationFrame: callback => {
			now += options.frameMs ?? 16;
			callback(now);
			return 1;
		},
		setTimeout: (callback, ms) => {
			now += ms;
			callback();
			return 0;
		},
		clearTimeout: () => {},
		dispatchEvent: event => {
			dispatched.push(`${event.type}:${event.code}`);
			if (options.consoleFaultOn && event.code === options.consoleFaultOn) {
				env.console.error('synthetic render fault');
			}
			movePlayer(event);
			return true;
		},
		KeyboardEvent: class {
			constructor(type, init = {}) {
				this.type = type;
				this.code = init.code;
			}
			preventDefault() {}
		},
		console: { error: () => {}, warn: () => {} },
		navigator: {},
		devicePixelRatio: 1,
		AwtsmoosMitzvahWorldEssentialBoot: {
			certified: true,
			milestones: {
				entryModuleExecuted: { status: 'complete', elapsedMilliseconds: 5 },
				rendererFirstFrame: { status: 'complete', elapsedMilliseconds: 50 },
				spawnTerrainExists: { status: 'complete', elapsedMilliseconds: 120 },
				canonicalChossidDecoded: { status: 'complete', elapsedMilliseconds: 400 },
				playerMovementEnabled: { status: 'complete', elapsedMilliseconds: 450 }
			},
			stalledMilestone: null
		},
		dispatched
	};
	if (options.world !== false) {
		env.AwtsmoosMitzvahWorld = {
			runtime: {
				player,
				renderer: { info: { render: { calls: 42, triangles: 9000 } } },
				scene: { children: [] }
			}
		};
	}
	function movePlayer(event) {
		if (event.type !== 'keydown') return;
		if (event.code === 'KeyW') player.position.z -= 2;
		if (event.code === 'KeyS') player.position.z += 2;
		if (event.code === 'KeyD') player.position.x += 0.5;
		if (event.code === 'KeyA') player.position.x -= 0.5;
	}
	return env;
}

test('probe passes with real scripted input, measured frames, and honest waivers', async () => {
	const env = fakeEnvironment();
	const probe = await runMitzvahWorldReleaseProbe(env, { durationMs: 2000, releaseId: 'test-gate' });
	assert.equal(probe.verdict, 'measured');
	assert.equal(probe.boot.status, 'pass');
	assert.equal(probe.performance.status, 'pass');
	assert.deepEqual(probe.performance.failures, []);
	assert.equal(probe.performance.evidence.frames.count > 10, true);
	assert.equal(probe.performance.evidence.frames.p95Milliseconds <= 16.7, true);
	const waived = probe.performance.evidence.waived.map(entry => entry.code);
	assert.ok(waived.includes('GENERATION_SLICE_UNSUPPORTED'));
	assert.equal(
		probe.performance.evidence.waived[0].reason,
		'live-path-has-no-chunk-generation-stage'
	);
	assert.equal(probe.performance.evidence.traversal.displacementMeters >= 1, true);
	assert.equal(probe.performance.evidence.traversal.positionSource, 'runtime.player.position');
	assert.ok(env.dispatched.includes('keydown:KeyW'));
	assert.ok(env.dispatched.includes('keyup:KeyW'));
	assert.equal(probe.chunks.status, 'pass');
	assert.equal(probe.chunks.evidence.scope, 'subsystem');
	assert.equal(probe.grass.status, 'pass');
	assert.equal(probe.network.status, 'pass');
	assert.equal(probe.console.status, 'pass');
	assert.equal(probe.memory.status, 'pass');
	assert.equal(probe.memory.evidence.heap, 'unsupported');
	assert.equal(probe.custody.status, 'pending');
	assert.equal(Object.isFrozen(probe), true);
	assert.equal(Object.isFrozen(probe.performance), true);
});

test('probe fails closed when essential boot never certifies', async () => {
	const env = fakeEnvironment();
	env.AwtsmoosMitzvahWorldEssentialBoot = null;
	const probe = await runMitzvahWorldReleaseProbe(env, { durationMs: 500 });
	assert.equal(probe.verdict, 'fail-closed');
	assert.equal(probe.failedAt, 'boot');
	assert.equal(probe.boot.status, 'fail');
	assert.ok(probe.boot.failures.includes('BOOT_SNAPSHOT_MISSING'));
});

test('probe fails closed on a stalled milestone with actionable evidence', async () => {
	const env = fakeEnvironment();
	env.AwtsmoosMitzvahWorldEssentialBoot = {
		certified: false,
		milestones: {
			entryModuleExecuted: { status: 'complete', elapsedMilliseconds: 5 },
			rendererFirstFrame: { status: 'failed', elapsedMilliseconds: 5000, failureCode: 'RENDERER_TIMEOUT', failureMessage: 'no frame' }
		},
		stalledMilestone: { name: 'rendererFirstFrame', failureCode: 'RENDERER_TIMEOUT', failureMessage: 'no frame' }
	};
	const probe = await runMitzvahWorldReleaseProbe(env, { durationMs: 500 });
	assert.equal(probe.verdict, 'fail-closed');
	assert.ok(probe.boot.failures.some(code => code.startsWith('BOOT_STALLED')));
	assert.equal(probe.boot.evidence.stalledMilestone.failureCode, 'RENDERER_TIMEOUT');
});

test('probe fails performance on repeated long frames without inventing data', async () => {
	const env = fakeEnvironment({ frameMs: 100 });
	const probe = await runMitzvahWorldReleaseProbe(env, { durationMs: 2000 });
	assert.equal(probe.performance.status, 'fail');
	assert.ok(probe.performance.failures.includes('FRAME_P95_OVER_16_7_MS'));
	assert.ok(probe.performance.failures.includes('REPEATED_FRAME_OVER_50_MS'));
	assert.equal(probe.performance.evidence.frames.framesOver50Milliseconds > 1, true);
});

test('probe fails traversal honestly when no position source exists', async () => {
	const env = fakeEnvironment({ world: false });
	const probe = await runMitzvahWorldReleaseProbe(env, { durationMs: 1000 });
	assert.ok(probe.performance.failures.includes('TRAVERSAL_POSITION_UNSUPPORTED'));
	assert.equal(probe.performance.evidence.traversal.positionSource, 'unsupported');
	assert.equal(probe.performance.evidence.traversal.displacementMeters, 'unsupported');
});

test('probe captures console errors into the console section', async () => {
	const env = fakeEnvironment({ consoleFaultOn: 'KeyD' });
	const probe = await runMitzvahWorldReleaseProbe(env, { durationMs: 2000 });
	assert.equal(probe.console.status, 'fail');
	assert.equal(probe.console.evidence.errorCount > 0, true);
	assert.ok(probe.console.failures[0].startsWith('CONSOLE_ERROR:'));
});

test('finalize publishes the immutable certification and certifies only when all pass', async () => {
	const env = fakeEnvironment();
	const probe = await runMitzvahWorldReleaseProbe(env, { durationMs: 1000 });
	const certification = finalizeMitzvahWorldReleaseCertification(
		probe,
		{ ok: true, repository: 'awtsmoos.com', bundles: {} },
		env
	);
	assert.equal(certification.certified, true);
	assert.deepEqual(certification.failedSections, []);
	assert.equal(certification.sections.custody.status, 'pass');
	assert.equal(env.AwtsmoosMitzvahWorldReleaseCertification, certification);
	assert.equal(Object.isFrozen(certification), true);
	assert.equal(Object.isFrozen(certification.sections), true);
});

test('finalize refuses certification without a custody receipt', async () => {
	const env = fakeEnvironment();
	const probe = await runMitzvahWorldReleaseProbe(env, { durationMs: 1000 });
	const certification = finalizeMitzvahWorldReleaseCertification(probe, null, env);
	assert.equal(certification.certified, false);
	assert.deepEqual(certification.failedSections, ['custody']);
	assert.ok(certification.sections.custody.failures.includes('CUSTODY_RECEIPT_MISSING'));
});
