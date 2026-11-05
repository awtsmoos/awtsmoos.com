// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file rendererHydrationLaunch.test.mjs
 * @description Verifies post-play rich hydration, single-use, and safe abort.
 * The Awtsmoos makes a new frame each instant and restores its rich colors;
 * Awtsmoos.com tests the one promised handoff without premature claims.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { startEretzRendererHydration } from '../../app/EretzRendererHydrationLaunch.js';
import { scheduleRendererHydration } from '../../app/RendererHydrationScheduler.js';
const source = name => readFile(new URL(`../../app/${name}`, import.meta.url), 'utf8');

test('renderer scheduler hydrates once after the specified quiet window', async () => {
	const fixture = hydrationFixture();
	const delegate = await scheduleRendererHydration(
		fixture.diagnostics, fixture.environment, null, { delayMilliseconds: 3 }
	);
	assert.equal(fixture.renderer.hydrateCalls, 1);
	assert.equal(delegate?.kind, 'rich-renderer');
	assert.equal(fixture.diagnostics.rendererHydrationStage, 'ready');
	assert.equal(fixture.diagnostics.rendererHydrationPolicy.delayMilliseconds, 3);
});

test('an already-aborted hydrate never invokes the renderer', async () => {
	const fixture = hydrationFixture();
	const controller = new AbortController();
	controller.abort();
	const result = await scheduleRendererHydration(
		fixture.diagnostics, fixture.environment, null,
		{ delayMilliseconds: 1, signal: controller.signal }
	);
	assert.equal(result, null);
	assert.equal(fixture.renderer.hydrateCalls, 0);
	assert.equal(fixture.diagnostics.rendererHydrationStage, 'aborted');
});

test('post-playable launcher reuses one durable hydration promise', async () => {
	const fixture = hydrationFixture();
	const first = startEretzRendererHydration(
		fixture.diagnostics, fixture.environment, null, { delayMilliseconds: 1 }
	);
	const second = startEretzRendererHydration(
		fixture.diagnostics, fixture.environment, null, { delayMilliseconds: 1 }
	);
	assert.equal(second, first);
	await first;
	assert.equal(fixture.renderer.hydrateCalls, 1);
});

test('runtime installs post-play promotion without premature publication', async () => {
	const runtime = await source('createEretzRuntime.js');
	const postPlay = await source('EretzPostPlayableActivation.js');
	const installed = runtime.indexOf('installEretzPostPlayableActivation(core, options, boot, environment)');
	const returned = runtime.indexOf('return core.diagnostics;');
	const activate = postPlay.indexOf('diagnostics.activatePostPlayable = () => {');
	const complete = postPlay.indexOf('boot.complete();');
	const launch = postPlay.indexOf('const visuals = startVisualPromotion(');
	assert.ok(installed >= 0 && returned > installed);
	assert.ok(activate >= 0 && complete > activate && launch > complete);
	assert.match(postPlay, /if \(activated\) return/);
	assert.match(postPlay, /startEretzVisualPromotionSequence\(/);
	assert.doesNotMatch(runtime, /publishRuntime\(/);
	assert.doesNotMatch(runtime, /scheduleRendererHydration/);
	assert.doesNotMatch(runtime, /rendererHydrationPromise\s*=\s*Promise\.resolve\(null\)/);
});

/** Creates a real promise-resolution and abort-aware scheduler fixture. */
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
		environment: {
			cancelIdleCallback() {}, clearTimeout() {}, document: null,
			requestIdleCallback(callback) {
				queueMicrotask(() => callback({ didTimeout: false, timeRemaining: () => 16 }));
				return 2;
			},
			setTimeout(callback) {
				queueMicrotask(callback);
				return 1;
			}
		},
		renderer
	};
}
