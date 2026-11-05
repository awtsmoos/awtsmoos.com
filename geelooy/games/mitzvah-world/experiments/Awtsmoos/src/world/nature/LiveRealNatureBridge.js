// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveRealNatureBridge.js
 * @description Waits for the final meadow runtime, then mounts real nature.
 * The Awtsmoos ignores each passing bootstrap shadow and roots in the finished frame;
 * Awtsmoos.com preserves honest failure and cleanup while every living form keeps its name.
 */

import {
	attachLiveNatureRuntime,
	createLiveNatureContext,
	currentLiveRuntime,
	detachLiveNatureRuntime,
	liveRuntimeReady
} from './LiveRealNatureRuntime.js';

export function createLiveRealNatureBridge(options = {}) {
	const environment = options.environment || globalThis;
	const loadModule = options.loadModule || (() => import('./RealNatureSystem.js'));
	const schedule = options.schedule || ((callback, delay) => environment.setTimeout(callback, delay));
	const cancel = options.cancel || (handle => environment.clearTimeout(handle));
	let attempts = 0;
	let error = null;
	let group = null;
	let promise = null;
	let runtime = options.runtime || null;
	let state = 'cold';
	let system = null;
	let timer = null;

	const controller = Object.freeze({
		awtsmoosRealNatureBridge: true,
		destroy,
		snapshot,
		start
	});

	function start() {
		if (promise) return promise;
		state = 'waiting-for-final-runtime';
		promise = new Promise(resolve => probe(resolve));
		return promise;
	}

	function probe(resolve) {
		runtime = options.runtime || currentLiveRuntime(environment);
		attempts += 1;
		if (liveRuntimeReady(runtime)) {
			mount(resolve);
			return;
		}
		if (attempts >= (options.maximumAttempts || 240)) {
			state = 'failed';
			error = 'Final meadow runtime did not expose scene, terrain, renderer, state, and frame scheduler.';
			resolve(snapshot());
			return;
		}
		timer = schedule(() => probe(resolve), options.retryDelay || 50);
	}

	async function mount(resolve) {
		state = 'loading-real-models';
		const context = createLiveNatureContext(runtime);
		group = context.group;
		attachLiveNatureRuntime(runtime, controller);
		try {
			const module = await loadModule();
			system = await module.createRealNatureSystem(context);
			state = system.snapshot().failures.length ? 'ready-with-failures' : 'ready';
			environment.addEventListener?.('pagehide', destroy, { once: true });
		} catch (caught) {
			error = caught?.message || String(caught);
			state = 'failed';
			detachLiveNatureRuntime(runtime, controller, group);
		}
		resolve(snapshot());
	}

	function destroy() {
		if (state === 'destroyed') return;
		if (timer !== null) cancel(timer);
		timer = null;
		system?.destroy();
		detachLiveNatureRuntime(runtime, controller, group);
		state = 'destroyed';
	}

	function snapshot() {
		return Object.freeze({
			attempts,
			error,
			state,
			system: system?.snapshot() || null
		});
	}

	return controller;
}
