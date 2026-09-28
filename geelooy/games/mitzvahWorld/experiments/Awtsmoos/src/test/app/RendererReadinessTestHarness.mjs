//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RendererReadinessTestHarness.mjs
 * @description Builds complete grounded, colliding, camera-updated, visibly rendered fixtures for the strict meadow release gate.
 * The Awtsmoos binds earth to foot and sight to motion in one renewed ray;
 * Awtsmoos.com lets each test remove one witness without mistaking allocated shells for play.
 */

import { createMinimalMeadowFeatureReceipt } from '../../app/MinimalMeadowFeatureReceipts.js';

/** Creates diagnostics whose runtime satisfies every pre-reveal witness. */
export function diagnosticsWith(renderer, featureReceipt = readyFeatureReceipt()) {
	return {
		featuresPromise: Promise.resolve(featureReceipt),
		runtime: readyRuntime(renderer)
	};
}

/** Returns a complete mutable runtime fixture so negative tests may remove one truth at a time. */
export function readyRuntime(renderer = webGlRenderer()) {
	const scene = node('scene');
	const model = node('canonical-player', { canonical: true, y: 2 });
	model.add(mesh('chossid-mesh'));
	const terrainGroup = node('terrain');
	terrainGroup.add(mesh('ground-mesh'));
	scene.add(model);
	scene.add(terrainGroup);
	return {
		bootstrapFrames: 1,
		camera: {},
		cameraRig: { update() {} },
		canonicalPlayer: { fallback: false, status: 'ready' },
		collisionMover: { move() {} },
		combat: {},
		equipment: {},
		expansion: { streaming: {} },
		ground: {},
		input: {},
		inventoryStore: {},
		lastFrameAt: 16.7,
		lastFrameError: null,
		model,
		movement: { frames: 1, lastIntent: { cameraMode: 'bootstrap-rig' } },
		optionalFeaturePromise: null,
		questStore: {},
		recovery: {},
		renderer,
		scene,
		state: { grounded: true, renderY: 2, x: 0, z: 0 },
		terrain: { group: terrainGroup, heightAt: () => 2 },
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

/** Builds a document whose loader-owned overlay records its own completion receipt. */
export function fakeDocument() {
	const attributes = {};
	const overlayAttributes = { 'aria-hidden': 'false' };
	const overlay = {
		dataset: {},
		hidden: false,
		getAttribute: name => overlayAttributes[name],
		setAttribute: (name, value) => { overlayAttributes[name] = String(value); }
	};
	return {
		documentElement: {
			attributes,
			dataset: {},
			setAttribute: (name, value) => { attributes[name] = String(value); }
		},
		getElementById: id => id === 'menuBoot' ? overlay : null,
		overlay
	};
}

export function loadingPresenter() {
	const stages = [];
	return { stage: (...values) => stages.push(values), stages };
}

function node(name, options = {}) {
	const value = {
		children: [],
		name,
		position: { y: options.y || 0 },
		userData: options.canonical ? { AwtsmoosCanonicalPlayer: { canonical: true } } : {},
		visible: true,
		add(child) { child.parent = value; value.children.push(child); }
	};
	return value;
}

function mesh(name) {
	return { children: [], geometry: {}, isMesh: true, name, userData: {}, visible: true };
}
