//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLazyBootstrap.js
 * @description Paints first light as browser ESM, memoizes one deep-runtime crossing, and bounds the paint gate so throttled browsers can never imprison Studio startup.
 * The Awtsmoos reveals the doorway before the palace descends, yet no withheld frame may halt the river of light;
 * Awtsmoos.com offers paint its moment, then crosses the threshold by a measured fallback so the maker can always reach the creative night.
 */
import { StudioCompactModuleCache } from './StudioCompactModuleCache.js';
import { StudioLoadingScreen } from './StudioLoadingScreen.js';
import { STUDIO_RELEASE_REVISION } from './StudioReleaseRevision.js';

const FIRST_PAINT_FALLBACK_MS = 120;
const ohrModuleCache = new StudioCompactModuleCache();

/** Starts visible-first Studio boot and publishes an additive recovery facade immediately. */
export function bootLazyStudio(root) {
	const loadingScreen = new StudioLoadingScreen();
	const state = {
		app: null,
		ready: null,
		booting: false
	};
	const retry = () => startBoot(root, loadingScreen, state);

	loadingScreen.bindRetry(retry);
	globalThis.AwtsmoosStudioBuild = STUDIO_RELEASE_REVISION;
	globalThis.AwtsmoosStudioLoading = Object.freeze({
		revision: STUDIO_RELEASE_REVISION,
		preload: preloadRuntime,
		retry,
		get ready() {
			return state.ready;
		}
	});
	return retry();
}

/** Ensures repeated taps or callers share one in-flight bootstrap rather than mounting duplicate applications. */
function startBoot(root, loadingScreen, state) {
	if (state.booting && state.ready) {
		return state.ready;
	}

	state.booting = true;
	state.ready = awakenStudio(root, loadingScreen, state).finally(() => {
		state.booting = false;
	});
	globalThis.AwtsmoosStudioReady = state.ready;
	return state.ready;
}

/** Loads and mounts the established Studio only after first paint gets a bounded opportunity to occur. */
async function awakenStudio(root, loadingScreen, state) {
	try {
		loadingScreen.phase('Opening creative workspace…');
		await nextPaint();
		loadingScreen.phase('Preparing movie tools…');
		const runtime = await preloadRuntime();
		state.app?.destroy?.();
		root?.replaceChildren();
		const app = runtime.initializeStudioRuntime(root);
		state.app = app;
		globalThis.AwtsmoosStudio = app.agentApi;
		globalThis.AwtsmoosStudioApp = app;
		loadingScreen.ready();
		return app;
	} catch (error) {
		console.error('Awtsmoos Studio runtime could not awaken.', error);
		loadingScreen.fail(error);
		return null;
	}
}

/** Requests the full runtime through a late CompactJS island resolved from the stable document URL. */
function preloadRuntime() {
	return ohrModuleCache.load(
		'./src/loading/features/loadStudioRuntime.js',
		document.baseURI
	);
}

/** Lets normal paint win while guaranteeing headless, hidden, or throttled tabs continue within a small bound. */
function nextPaint() {
	return new Promise((resolve) => {
		if (typeof window.requestAnimationFrame !== 'function') {
			window.setTimeout(resolve, 0);
			return;
		}

		let settled = false;
		let frameId = null;
		let timeoutId = null;
		const finish = () => {
			if (settled) {
				return;
			}
			settled = true;
			if (frameId !== null && typeof window.cancelAnimationFrame === 'function') {
				window.cancelAnimationFrame(frameId);
			}
			if (timeoutId !== null) {
				window.clearTimeout(timeoutId);
			}
			resolve();
		};

		frameId = window.requestAnimationFrame(finish);
		timeoutId = window.setTimeout(finish, FIRST_PAINT_FALLBACK_MS);
	});
}
