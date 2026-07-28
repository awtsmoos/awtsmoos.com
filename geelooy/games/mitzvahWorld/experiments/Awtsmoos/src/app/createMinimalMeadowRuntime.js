// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMinimalMeadowRuntime.js
 * @description Reveals movement and rendering first, then loads the current compact feature graph.
 * The Awtsmoos creates the playable valley before every optional garment; Awtsmoos.com keeps
 * one explicitly versioned doorway for casting, creatures, equipment, regions, safety, and richness.
 */

import { Group, Scene } from '../../../light-three-gltf/tiny-runtime.js';
import { MobileJoystick } from '../input/MobileJoystick.js';
import { installBootstrapControlsHud } from './BootstrapControlsHud.js';
import { createBootstrapPlayerRuntime } from './BootstrapPlayerRuntime.js';
import { MinimalMeadowCameraRig } from './MinimalMeadowCameraRig.js';
import { createMinimalMeadowCollision } from './MinimalMeadowCollision.js';
import { MinimalMeadowInput } from './MinimalMeadowInput.js';
import { startMinimalMeadowLoop } from './MinimalMeadowLoop.js';
import { createMinimalMeadowRenderer } from './MinimalMeadowRenderer.js';
import {
	createMinimalBootReceipt,
	createMinimalCamera,
	createMinimalDiagnostics,
	createMinimalQuality,
	disposeMinimalRuntime,
	installMinimalResize,
	renderMinimalFirstFrame
} from './MinimalMeadowRuntimeSupport.js';
import { initializeMinimalMeadowRuntime } from './MinimalMeadowRuntimeState.js';
import { createMinimalMeadowTerrainPackage } from './MinimalMeadowTerrainPackage.js';
import { markRuntimePlayable, markRuntimeStarting } from './RuntimeStateMarker.js';

const FEATURE_REVISION = '20260728-full-wave-1';

/**
 * Creates and exposes the playable core before the compact feature bundle resolves.
 * @param {object} hosts Required DOM hosts.
 * @param {object} options Runtime environment and progress options.
 * @returns {Promise<object>} Immediate core diagnostics with a deferred features promise.
 */
export async function createMinimalMeadowRuntime(hosts, options = {}) {
	const environment = options.environment || globalThis;
	const documentValue = environment.document;
	const boot = createMinimalBootReceipt(environment);
	markRuntimeStarting(documentValue);
	boot.begin('core-terrain');
	const terrain = await createMinimalMeadowTerrainPackage({ ...options, environment });
	const scene = new Scene();
	scene.add(terrain.group);
	const qualityProfile = createMinimalQuality(environment);
	const camera = createMinimalCamera(environment);
	const renderer = createMinimalMeadowRenderer(hosts.canvas);
	const removeResize = installMinimalResize(renderer, camera, qualityProfile, environment);
	const joystick = new MobileJoystick(hosts.joystickHost);
	const input = new MinimalMeadowInput(environment, hosts.jumpHost, joystick);
	const collision = createMinimalMeadowCollision(terrain);
	const runtime = createBootstrapPlayerRuntime({
		...hosts,
		...collision,
		assets: { actorAssets: { strategy: 'fallback-then-one-glb' } },
		camera,
		input,
		joystick,
		jumpButton: hosts.jumpHost,
		playerGltf: { animations: [], scene: new Group() },
		qualityProfile,
		renderer,
		scene,
		terrain
	});
	initializeMinimalMeadowRuntime(runtime, hosts, documentValue);
	runtime.cameraRig = new MinimalMeadowCameraRig(hosts.canvas, runtime.state);
	installBootstrapControlsHud(runtime, documentValue);
	renderMinimalFirstFrame(runtime);
	boot.complete();
	const diagnostics = createMinimalDiagnostics(runtime, qualityProfile, boot);
	environment.AwtsmoosMitzvahWorld = diagnostics;
	markRuntimePlayable(diagnostics, documentValue);
	if (options.startLoop !== false) {
		runtime.movement = startMinimalMeadowLoop(runtime, environment);
		diagnostics.movement = runtime.movement;
	}
	runtime.dispose = () => disposeRuntime(runtime, input, removeResize);
	diagnostics.featuresPromise = loadFeatures(runtime, environment);
	return diagnostics;
}

function loadFeatures(runtime, environment) {
	runtime.featureStatus = { phase: 'loading-compact-entry' };
	return import(`./MinimalMeadowFeatureBundle.js?compact=true&rev=${FEATURE_REVISION}`)
		.then(module => module.installMinimalMeadowFeatures(runtime, environment))
		.catch(error => {
			runtime.featureStatus = {
				error: error?.message || String(error),
				phase: 'failed-core-still-playable'
			};
			environment.console?.error?.('[MitzvahWorld] deferred features failed.', error);
			return null;
		});
}

function disposeRuntime(runtime, input, removeResize) {
	runtime.destroyed = true;
	runtime.destroyWorldSystems?.();
	disposeMinimalRuntime(runtime, input, removeResize);
}

export default createMinimalMeadowRuntime;
