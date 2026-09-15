//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RendererReadinessTestHarness.mjs
 * @description Builds complete visibly playable fixtures for the essential readiness contract.
 * The Awtsmoos gives each test vessel attached Chossid, terrain, movement, frame evidence, and WebGL;
 * Awtsmoos.com can then remove one organ at a time without confusing object allocation for visible gameplay.
 */

import { createMinimalMeadowFeatureReceipt } from '../../app/MinimalMeadowFeatureReceipts.js';

/** Creates diagnostics whose runtime satisfies the complete visible-playability covenant. */
export function diagnosticsWith(renderer, featureReceipt = readyFeatureReceipt()) {
	return {
		featuresPromise: Promise.resolve(featureReceipt),
		runtime: readyRuntime(renderer)
	};
}

/** Returns a complete mutable runtime fixture so negative tests may remove one truth at a time. */
export function readyRuntime(renderer = webGlRenderer()) {
	const scene = node('scene');
	const model = node('canonical-player', { canonical: true });
	model.add(mesh('chossid-mesh'));
	const terrainGroup = node('terrain');
	terrainGroup.add(mesh('ground-mesh'));
	scene.add(model);
	scene.add(terrainGroup);
	return {
		bootstrapFrames: 1,
		camera: {},
		canonicalPlayer: { fallback: false, status: 'ready' },
		combat: {},
		equipment: {},
		expansion: { streaming: {} },
		ground: {},
		input: {},
		inventoryStore: {},
		lastFrameAt: 16.7,
		lastFrameError: null,
		model,
		movement: {},
		optionalFeaturePromise: null,
		questStore: {},
		recovery: {},
		renderer,
		scene,
		terrain: { group: terrainGroup },
		visiblePlayer: model
	};
}

export function readyFeatureReceipt(optionalPromise = null) {
	return createMinimalMeadowFeatureReceipt({
		essential: {
			combat: true, equipment: true, inventory: true, missing: [], quest: true,
			ready: true, recovery: true, streaming: true, ui: true
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
			setAttribute: (name, value) => { attributes[name] = String(value); }
		}
	};
}

export function fakeEnvironment() {
	const warnings = [];
	return { console: { warn: (...values) => warnings.push(values) }, warnings };
}

export function loadingPresenter() {
	const stages = [];
	return { stage: (...values) => stages.push(values), stages };
}

function node(name, options = {}) {
	const value = {
		children: [],
		name,
		userData: options.canonical ? { AwtsmoosCanonicalPlayer: { canonical: true } } : {},
		visible: true,
		add(child) { child.parent = value; value.children.push(child); }
	};
	return value;
}

function mesh(name) {
	return { children: [], geometry: {}, isMesh: true, name, userData: {}, visible: true };
}
