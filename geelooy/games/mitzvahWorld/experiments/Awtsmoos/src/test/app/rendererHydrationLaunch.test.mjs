// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file rendererHydrationLaunch.test.mjs
 * @description Proves rich WebGL begins after publication, once, after its own quiet window, and remains abort-safe.
 * The Awtsmoos reveals playability before radiance without confusing delay for abandonment;
 * Awtsmoos.com proves bootstrap stays first while the richer renderer receives one inevitable, measurable handoff.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { startEretzRendererHydration } from '../../app/EretzRendererHydrationLaunch.js';
import { scheduleRendererHydration } from '../../app/RendererHydrationScheduler.js';

const RUNTIME_SOURCE_URL = new URL('../../app/createEretzRuntime.js', import.meta.url);

test('B"H renderer scheduler hydrates once after its renderer-specific quiet window', async () => {
	const fixture = hydrationFixture();
	const promise = scheduleRendererHydration(
		fixture.diagnostics,
		fixture.environment,
		null,
		{ delayMilliseconds: 3 }
	);
	const delegate = await promise;
	assert.equal(fixture.renderer.hydrateCalls, 1);
	assert.equal(delegate?.kind, 'rich-renderer');
	assert.equal(fixture.diagnostics.rendererHydrationStage, 'ready');
	assert.equal(fixture.diagnostics.rendererHydrationPolicy.delayMilliseconds, 3);
});

test('already-aborted hydration never invokes the renderer', async () => {
	const fixture = hydrationFixture();
	const controller = new AbortController();
	controller.abort();
	const result = await scheduleRendererHydration(
		fixture.diagnostics,
		fixture.environment,
		null,
		{ delayMilliseconds: 1, signal: controller.signal }
	);
	assert.equal(result, null);
	assert.equal(fixture.renderer.hydrateCalls, 0);
	assert.equal(fixture.diagnostics.rendererHydrationStage, 'aborted');
});

test('post-playable launcher reuses one durable hydration promise', async () => {
	const fixture = hydrationFixture();
	const first = startEretzRendererHydration(
		fixture.diagnostics,
		fixture.environment,
		null,
		{ delayMilliseconds: 1 }
	);
	const second = startEretzRendererHydration(
		fixture.diagnostics,
		fixture.environment,
		null,
		{ delayMilliseconds: 1 }
	);
	assert.equal(second, first);
	await first;
	assert.equal(fixture.renderer.hydrateCalls, 1);
});

test('runtime publishes before renderer policy launch and retains no eager scheduler or null promise', async () => {
	const source = await readFile(RUNTIME_SOURCE_URL, 'utf8');
	const publication = source.indexOf('publishRuntime(core.diagnostics, environment)');
	const policyLaunch = source.indexOf('startEretzRendererByWorldPolicy(');
	assert.ok(publication >= 0);
	assert.ok(policyLaunch > publication);
	assert.doesNotMatch(source, /scheduleRendererHydration/);
	assert.doesNotMatch(source, /rendererHydrationPromise\s*=\s*Promise\.resolve\(null\)/);
	assert.match(source, /startEretzRendererByWorldPolicy/);
});

function hydrationFixture() {
	const renderer = {
		delegate: null,
		hydrateCalls: 0,
		hydrationState: 'idle',
		async hydrate() {
			this.hydrateCalls += 1;
			this.hydrationState = 'ready';
			this.delegate = { kind: 'rich-renderer' };
			return this.delegate;
		}
	};
	return {
		diagnostics: { runtime: { renderer } },
		environment: immediateQuietEnvironment(),
		renderer
	};
}

function immediateQuietEnvironment() {
	return {
		cancelIdleCallback() {},
		clearTimeout() {},
		document: null,
		requestIdleCallback(callback) {
			queueMicrotask(() => callback({ didTimeout: false, timeRemaining: () => 16 }));
			return 2;
		},
		setTimeout(callback) {
			queueMicrotask(callback);
			return 1;
		}
	};
}
