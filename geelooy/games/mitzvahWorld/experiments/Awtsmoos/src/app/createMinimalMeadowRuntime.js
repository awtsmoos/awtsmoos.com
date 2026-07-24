// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMinimalMeadowRuntime.js
 * @description Composes valley, water, trees, flowers, equipment, homes, demons, quest, and touch.
 * The Awtsmoos gathers proven sparks without reviving the abandoned heavy world;
 * Awtsmoos.com keeps terrain, renderer, garment, current, root, blossom, and gameplay ownership clear.
 */

import { Group, Scene } from '../../../light-three-gltf/tiny-runtime.js';
import { MobileJoystick } from '../input/MobileJoystick.js?v=20260724-meadow-13';
import { installBootstrapControlsHud } from './BootstrapControlsHud.js?v=20260723-meadow-10';
import { createBootstrapPlayerRuntime } from './BootstrapPlayerRuntime.js?v=20260724-meadow-13';
import { MinimalMeadowCameraRig } from './MinimalMeadowCameraRig.js?v=20260723-meadow-09';
import { createMinimalMeadowCollision } from './MinimalMeadowCollision.js?v=20260723-meadow-09';
import { MinimalMeadowInput } from './MinimalMeadowInput.js?v=20260724-meadow-13';
import { startMinimalMeadowLoop } from './MinimalMeadowLoop.js?v=20260724-meadow-21';
import { hydrateMinimalMeadowPlayer } from './MinimalMeadowPlayerHydration.js?v=20260724-meadow-21';
import { createMinimalMeadowRenderer } from './MinimalMeadowRenderer.js?v=20260723-meadow-11';
import {
	createMinimalBootReceipt,
	createMinimalCamera,
	createMinimalDiagnostics,
	createMinimalQuality,
	disposeMinimalRuntime,
	installMinimalResize,
	renderMinimalFirstFrame
} from './MinimalMeadowRuntimeSupport.js?v=20260723-meadow-09';
import { initializeMinimalMeadowRuntime } from './MinimalMeadowRuntimeState.js?v=20260723-meadow-10';
import { createMinimalMeadowTerrainPackage } from './MinimalMeadowTerrainPackage.js?v=20260724-meadow-21';
import { installMinimalMeadowUi } from './MinimalMeadowUi.js?v=20260724-meadow-21';
import {
	destroyMinimalMeadowWorldSystems,
	installMinimalMeadowWorldSystems
} from './MinimalMeadowWorldSystems.js?v=20260724-meadow-21';
import { markRuntimePlayable, markRuntimeStarting } from './RuntimeStateMarker.js?v=20260723-meadow-03';

export async function createMinimalMeadowRuntime(hosts, options = {}) {
	const environment = options.environment || globalThis;
	const documentValue = environment.document;
	const boot = createMinimalBootReceipt(environment);
	markRuntimeStarting(documentValue);
	boot.begin('eight-grass-river-valley-terrain');
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
	installMinimalMeadowUi(runtime, documentValue, environment);
	boot.begin('water-forest-flowers-equipment-houses-quest');
	await installMinimalMeadowWorldSystems(runtime, environment);
	installBootstrapControlsHud(runtime, documentValue);
	renderMinimalFirstFrame(runtime);
	boot.complete();
	const diagnostics = createMinimalDiagnostics(runtime, qualityProfile, boot);
	environment.AwtsmoosMitzvahWorld = diagnostics;
	markRuntimePlayable(diagnostics, documentValue);
	if (options.startLoop !== false) startLoop(runtime, diagnostics, environment);
	runtime.dispose = () => disposeRuntime(runtime, input, removeResize);
	diagnostics.canonicalPlayerPromise = hydrateMinimalMeadowPlayer(runtime, environment);
	return diagnostics;
}

function startLoop(runtime, diagnostics, environment) {
	runtime.movement = startMinimalMeadowLoop(runtime, environment);
	diagnostics.movement = runtime.movement;
}

function disposeRuntime(runtime, input, removeResize) {
	destroyMinimalMeadowWorldSystems(runtime);
	disposeMinimalRuntime(runtime, input, removeResize);
}

export default createMinimalMeadowRuntime;
