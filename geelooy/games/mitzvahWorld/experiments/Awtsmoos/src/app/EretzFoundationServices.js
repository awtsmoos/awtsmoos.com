// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFoundationServices.js
 * @description Creates an authored wide-arrival camera and reference-lit renderer services.
 * The Awtsmoos recreates observer and valley each instant; Awtsmoos.com frames the traveler
 * as a participant inside water, bridge, cottages, forest, and mountains rather than the subject.
 */

import { PerspectiveCamera, Scene } from '../../../light-three-gltf/tiny-runtime.js';
import { StaticOpaqueBatcher } from '../../../light-three-gltf/tiny-static-opaque-batcher.js';
import { TinyWebGLRenderer } from '../../../light-three-gltf/tiny-webgl-renderer.js';
import { CameraOrbitController } from '../camera/CameraOrbitController.js';
import { JumpButton } from '../input/JumpButton.js';
import { MobileJoystick } from '../input/MobileJoystick.js';
import { UiEventSystem } from '../input/UiEventSystem.js';
import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';
import { REFERENCE_GOLDEN_HOUR } from '../world/lighting/ReferenceGoldenHourPreset.js';
import { VILLAGE_ARRIVAL_CAMERA } from '../world/village/VillageArrivalContract.js';

const GOLDEN_HOUR_ENVIRONMENT = referenceEnvironment(REFERENCE_GOLDEN_HOUR);

export function createEretzFoundationServices(hosts, qualityProfile) {
	const scene = new Scene();
	const camera = new PerspectiveCamera(
		VILLAGE_ARRIVAL_CAMERA.fov,
		innerWidth / innerHeight,
		0.08,
		1600
	);
	const renderer = createRenderer(hosts.canvas, qualityProfile);
	const bus = new AwtsmoosEventBus();
	const input = new UiEventSystem(hosts.canvas).install(bus);
	return {
		bus,
		camera,
		input,
		joystick: new MobileJoystick(hosts.joystickHost),
		jumpButton: new JumpButton(hosts.jumpHost),
		orbit: createArrivalOrbit(hosts.canvas),
		renderer,
		scene
	};
}

function createRenderer(canvas, qualityProfile) {
	const renderer = new TinyWebGLRenderer({ canvas });
	renderer.options.culling = true;
	renderer.options.defaultRenderDistance = qualityProfile.renderDistance;
	renderer.options.staticBatcher = new StaticOpaqueBatcher();
	renderer.setClearColor(...GOLDEN_HOUR_ENVIRONMENT.fogColor, 1);
	renderer.setEnvironment({
		...GOLDEN_HOUR_ENVIRONMENT,
		fogFar: qualityProfile.renderDistance * 1.08,
		fogNear: qualityProfile.renderDistance * 0.34
	});
	return renderer;
}

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

function referenceEnvironment(reference) {
	const cool = reference.coolShadow;
	const horizon = reference.horizonColor;
	const sun = reference.sunCore;
	return Object.freeze({
		ambient: Object.freeze([cool[0] * 0.66, cool[1] * 0.62, cool[2] * 0.58]),
		exposure: 1.1,
		fogColor: Object.freeze([
			cool[0] * 0.55 + horizon[0] * 0.45,
			cool[1] * 0.55 + horizon[1] * 0.45,
			cool[2] * 0.55 + horizon[2] * 0.45
		]),
		sunColor: Object.freeze([sun[0] * 1.32, sun[1] * 1.32, sun[2] * 1.32]),
		sunDirection: Object.freeze(normalized(reference.sunPosition))
	});
}

function normalized(vector) {
	const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
	return [vector[0] / length, vector[1] / length, vector[2] / length];
}
