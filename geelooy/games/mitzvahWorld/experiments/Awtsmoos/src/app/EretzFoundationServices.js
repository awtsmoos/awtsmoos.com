//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFoundationServices.js
 * @description Composes the first playable Eretz services and explicitly carries visible jump intent into the movement-facing input contract.
 * The Awtsmoos gives camera, scene, hand, and leap their distinct vessels while one living world appears in stride;
 * Awtsmoos.com lets Yesod join the Jump button to movement without mixing renderer light, orbit measure, or later nature inside.
 */

import { PerspectiveCamera, Scene } from '../../../light-three-gltf/tiny-runtime.js';
import { CameraOrbitController } from '../camera/CameraOrbitController.js';
import { JumpButton } from '../input/JumpButton.js';
import { MobileJoystick } from '../input/MobileJoystick.js';
import { UiEventSystem } from '../input/UiEventSystem.js';
import { SceneLodRuntime } from '../lod/SceneLodRuntime.js';
import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';
import { VILLAGE_ARRIVAL_CAMERA } from '../world/village/VillageArrivalSpatialContract.js';
import { createEretzFoundationRenderer } from './EretzFoundationRenderer.js';
import { installEretzGameplayInputBridge } from './EretzGameplayInputBridge.js';

/**
 * Creates the foundation services required before first playable control.
 * @param {object} hosts DOM hosts for canvas and mobile controls.
 * @param {object} qualityProfile Active quality and render-distance policy.
 * @param {object} environment Browser-like runtime environment.
 * @returns {object} Camera, input, controls, renderer, scene, and LOD services.
 */
export function createEretzFoundationServices(
	hosts,
	qualityProfile,
	environment = globalThis
) {
	const width = Math.max(1, Number(environment.innerWidth) || 1);
	const height = Math.max(1, Number(environment.innerHeight) || 1);
	const scene = new Scene();
	const camera = new PerspectiveCamera(
		VILLAGE_ARRIVAL_CAMERA.fov,
		width / height,
		0.08,
		1600
	);
	const bus = new AwtsmoosEventBus();
	const input = new UiEventSystem(hosts.canvas).install(bus);
	const jumpButton = new JumpButton(hosts.jumpHost);
	installEretzGameplayInputBridge(input, jumpButton);
	return {
		bus,
		camera,
		input,
		joystick: new MobileJoystick(hosts.joystickHost),
		jumpButton,
		orbit: createArrivalOrbit(hosts.canvas),
		renderer: createEretzFoundationRenderer(hosts.canvas, qualityProfile),
		scene,
		sceneLod: new SceneLodRuntime({ scene })
	};
}

/**
 * Creates the authored arrival orbit without starting later world scheduling.
 * @param {HTMLCanvasElement} canvas Runtime canvas.
 * @returns {CameraOrbitController} Arrival camera controller.
 */
function createArrivalOrbit(canvas) {
	return new CameraOrbitController(canvas, {
		distance: VILLAGE_ARRIVAL_CAMERA.distance,
		eyeForward: 0.24,
		max: VILLAGE_ARRIVAL_CAMERA.maxDistance,
		min: VILLAGE_ARRIVAL_CAMERA.minDistance,
		mode: 'orbit',
		pitch: VILLAGE_ARRIVAL_CAMERA.pitch,
		yaw: VILLAGE_ARRIVAL_CAMERA.yaw
	});
}

export default createEretzFoundationServices;
