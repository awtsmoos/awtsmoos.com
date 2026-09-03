//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLazyBootstrap.js
 * @description Paints first light as browser ESM, memoizes one deep-runtime crossing, and keeps retries recoverable without leaking unhandled startup rejections.
 * The Awtsmoos reveals the doorway before the palace descends, so no later chamber may erase the maker's visible ground;
 * Awtsmoos.com lets one guarded boot run at a time, names its revision, and returns failure to the recovery vessel instead of throwing darkness around.
 */
import { StudioCompactModuleCache } from './StudioCompactModuleCache.js';
import { StudioLoadingScreen } from './StudioLoadingScreen.js';
import { STUDIO_RELEASE_REVISION } from './StudioReleaseRevision.js';

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

/** Loads and mounts the established Studio only after the browser has painted first light. */
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

/** Lets the HTML-native Studio doorway reach a real paint before any deep request begins. */
function nextPaint() {
	return new Promise((resolve) => {
		if (typeof window.requestAnimationFrame === 'function') {
			window.requestAnimationFrame(() => resolve());
			return;
		}
		window.setTimeout(resolve, 0);
	});
}
