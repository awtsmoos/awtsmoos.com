// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RendererReadinessTestHarness.mjs
 * @description Builds focused launcher vessels for renderer identity and hydration tests.
 * The Awtsmoos clothes each test in only the finite organs it must reveal;
 * Awtsmoos.com keeps fixtures apart from assertions so both remain small, honest, and real.
 */

export function diagnosticsWith(renderer) {
	return {
		featuresPromise: Promise.resolve({ ready: true }),
		runtime: {
			bootstrapHud: { refresh() {} },
			camera: {},
			cameraRig: { update() {} },
			mainOctree: {},
			renderer,
			scene: {},
			state: {},
			ui: { refresh() {} }
		}
	};
}

export function fallbackRenderer() {
	return {
		backend: 'canvas-2d-fallback',
		contextName: '2d',
		fallbackEvidence: Object.freeze({
			code: 'webgl-unavailable',
			contextAttempts: Object.freeze(['webgl']),
			message: 'WebGL is not available.',
			recoverable: true
		}),
		hydrationState: 'fallback-2d',
		render() {},
		setInteractor() {}
	};
}

export function webGlRenderer(hydrateDelegate) {
	const renderer = {
		backend: 'webgl',
		contextName: 'webgl',
		hydrationState: 'idle',
		hydrate(...values) {
			renderer.hydrationState = 'loading';
			return Promise.resolve()
				.then(() => hydrateDelegate(...values))
				.then((delegate) => {
					renderer.hydrationState = 'ready';
					return delegate;
				})
				.catch((error) => {
					renderer.hydrationState = 'degraded';
					throw error;
				});
		},
		render() {},
		setInteractor() {}
	};

	return renderer;
}

export function fakeDocument() {
	return {
		documentElement: {
			dataset: {}
		}
	};
}

export function fakeEnvironment() {
	const warnings = [];

	return {
		console: {
			warn: (...values) => {
				warnings.push(values);
			}
		},
		warnings
	};
}

export function loadingPresenter() {
	return {
		world() {}
	};
}
