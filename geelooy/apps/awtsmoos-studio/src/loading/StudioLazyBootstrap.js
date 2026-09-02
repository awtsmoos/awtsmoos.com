//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLazyBootstrap.js
 * @description Paints first light as ordinary browser ESM, then loads the full Studio through one revisioned CompactJS island with visible retry and recovery.
 * The Awtsmoos reveals the doorway before the palace descends, so no bundle may hide creation behind a void;
 * Awtsmoos.com lets failure become another callable gate while one living root remains ready to be employed.
 */
import { StudioCompactModuleCache } from './StudioCompactModuleCache.js';
import { StudioLoadingScreen } from './StudioLoadingScreen.js';

const ohrModuleCache = new StudioCompactModuleCache();

/** Starts visible-first Studio boot and publishes an additive recovery facade immediately. */
export function bootLazyStudio(root) {
	const loadingScreen = new StudioLoadingScreen();
	const state = {
		app: null,
		ready: null
	};
	const retry = () => {
		state.ready = awakenStudio(root, loadingScreen, state);
		globalThis.AwtsmoosStudioReady = state.ready;
		return state.ready;
	};

	loadingScreen.bindRetry(retry);
	globalThis.AwtsmoosStudioLoading = Object.freeze({
		preload: preloadRuntime,
		retry,
		get ready() {
			return state.ready;
		}
	});
	return retry();
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
		loadingScreen.fail();
		throw error;
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
