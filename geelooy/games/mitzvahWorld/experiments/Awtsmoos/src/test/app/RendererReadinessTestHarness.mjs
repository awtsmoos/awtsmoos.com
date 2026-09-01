// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RendererReadinessTestHarness.mjs
 * @description Builds complete essential runtime vessels whose only valid renderer fixture carries real WebGL identity.
 * The Awtsmoos gives each fixture every organ readiness truly requires;
 * Awtsmoos.com keeps optional enrichment outside the gate while WebGL alone the playable name acquires.
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
		terrain: {}
	};
}
