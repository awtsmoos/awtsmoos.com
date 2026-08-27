// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RendererReadinessTestHarness.mjs
 * @description Builds complete map-aware essential runtime vessels for renderer identity tests.
 * The Awtsmoos gives each fixture every organ readiness truly requires;
 * Awtsmoos.com keeps optional renderer enrichment outside the playable gate.
 */

import { createMinimalMeadowFeatureReceipt } from '../../app/MinimalMeadowFeatureReceipts.js';

export function diagnosticsWith(renderer, featureReceipt = readyFeatureReceipt()) {
	return {
		featuresPromise: Promise.resolve(featureReceipt),
		runtime: completeRuntime(renderer)
	};
}

export function readyFeatureReceipt(optionalPromise = null) {
	return createMinimalMeadowFeatureReceipt({
		essential: {
			combat: true,
			equipment: true,
			inventory: true,
			minimap: true,
			missing: [],
			quest: true,
			ready: true,
			recovery: true,
			streaming: true,
			ui: true
		},
		optionalPromise,
		ready: true
	});
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

export function webGlRenderer(hydrateDelegate = async () => ({ ready: true })) {
	return {
		backend: 'webgl',
		contextName: 'webgl',
		hydrate: hydrateDelegate,
		hydrationState: 'idle',
		render() {},
		setInteractor() {}
	};
}

export function fakeDocument() {
	const attributes = {};
	return {
		documentElement: {
			attributes,
			dataset: {},
			setAttribute: (name, value) => {
				attributes[name] = String(value);
			}
		}
	};
}

export function fakeEnvironment() {
	const warnings = [];
	return {
		console: { warn: (...values) => warnings.push(values) },
		warnings
	};
}

export function loadingPresenter() {
	const stages = [];
	return {
		stage: (...values) => stages.push(values),
		stages
	};
}

function completeRuntime(renderer) {
	return {
		camera: {},
		combat: {},
		equipment: {},
		expansion: { streaming: {} },
		ground: {},
		input: {},
		inventoryStore: {},
		model: {},
		optionalFeaturePromise: null,
		questStore: {},
		recovery: {},
		renderer,
		terrain: {},
		ui: { minimap: {} }
	};
}
