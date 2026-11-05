// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFoundationServices.js
 * @description Composes first-play services while giving the bootstrap orbit the same portrait framing policy later rich cameras already honor.
 * The Awtsmoos joins scene, hand, leap, and gaze without confusing their vessels; Awtsmoos.com lets the first camera already know
 * whether it stands in a narrow mobile window, so the traveler fills the frame before any richer camera garment arrives.
 */

import { PerspectiveCamera, Scene } from '../../../light-three-gltf/tiny-runtime.js';
import { CameraOrbitController } from '../camera/CameraOrbitController.js';
import { minimalMeadowViewportCameraPolicy } from '../camera/MinimalMeadowViewportCameraPolicy.js';
import { JumpButton } from '../input/JumpButton.js';
import { MobileJoystick } from '../input/MobileJoystick.js';
import { UiEventSystem } from '../input/UiEventSystem.js';
import { SceneLodRuntime } from '../lod/SceneLodRuntime.js';
import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';
import { VILLAGE_ARRIVAL_CAMERA } from '../world/village/VillageArrivalSpatialContract.js';
import { createEretzFoundationRenderer } from './EretzFoundationRenderer.js';
import { installEretzGameplayInputBridge } from './EretzGameplayInputBridge.js';

/** Creates camera, input, controls, renderer, scene, and LOD services required before first movement. */
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
		orbit: createArrivalOrbit(hosts.canvas, environment),
		renderer: createEretzFoundationRenderer(hosts.canvas, qualityProfile),
		scene,
		sceneLod: new SceneLodRuntime({ scene })
	};
}

/** Creates the authored orbit with viewport-aware distance and target lift but unchanged gesture bounds. */
function createArrivalOrbit(canvas, environment) {
	const viewport = minimalMeadowViewportCameraPolicy(environment);
	const orbit = new CameraOrbitController(canvas, {
		distance: viewport.distance,
		eyeForward: 0.24,
		max: VILLAGE_ARRIVAL_CAMERA.maxDistance,
		min: VILLAGE_ARRIVAL_CAMERA.minDistance,
		mode: 'orbit',
		pitch: VILLAGE_ARRIVAL_CAMERA.pitch,
		yaw: VILLAGE_ARRIVAL_CAMERA.yaw
	});
	orbit.viewportMode = viewport.mode;
	orbit.viewportTargetLift = viewport.targetLift;
	return orbit;
}

export default createEretzFoundationServices;
