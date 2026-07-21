// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFoundationServices.js
 * @description Creates a wide-arrival camera and material-readable golden-hour environment.
 * The Awtsmoos recreates observer, warm sun, and cool return each instant; Awtsmoos.com keeps
 * stone texture, dark timber, slate roofs, vegetation, and roads readable without flattening shade.
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
import { VILLAGE_ARRIVAL_CAMERA } from '../world/village/VillageArrivalContract.js?v=20260720-canonical-valley-pass-04';

const GOLDEN_HOUR_ENVIRONMENT = referenceEnvironment(REFERENCE_GOLDEN_HOUR);

export function createEretzFoundationServices(hosts, qualityProfile) {
	const scene = new Scene();
	const camera = new PerspectiveCamera(
		VILLAGE_ARRIVAL_CAMERA.fov, innerWidth / innerHeight, 0.08, 1600
	);
	const renderer = createRenderer(hosts.canvas, qualityProfile);
	const bus = new AwtsmoosEventBus();
	const input = new UiEventSystem(hosts.canvas).install(bus);
	return {
		bus, camera, input,
		joystick: new MobileJoystick(hosts.joystickHost),
		jumpButton: new JumpButton(hosts.jumpHost),
		orbit: createArrivalOrbit(hosts.canvas), renderer, scene
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
		fogNear: qualityProfile.renderDistance * 0.38
	});
	return renderer;
}

function createArrivalOrbit(canvas) {
	return new CameraOrbitController(canvas, {
		distance: VILLAGE_ARRIVAL_CAMERA.distance, eyeForward: 0.24,
		max: VILLAGE_ARRIVAL_CAMERA.maxDistance, min: VILLAGE_ARRIVAL_CAMERA.minDistance,
		mode: 'orbit', pitch: VILLAGE_ARRIVAL_CAMERA.pitch, yaw: VILLAGE_ARRIVAL_CAMERA.yaw
	});
}

function referenceEnvironment(reference) {
	const cool = reference.coolShadow;
	const horizon = reference.horizonColor;
	const sun = reference.sunCore;
	return Object.freeze({
		ambient: Object.freeze([
			cool[0] * 0.72 + 0.13,
			cool[1] * 0.7 + 0.1,
			cool[2] * 0.66 + 0.08
		]),
		exposure: 1.18,
		fogColor: Object.freeze([
			cool[0] * 0.66 + horizon[0] * 0.34,
			cool[1] * 0.68 + horizon[1] * 0.32,
			cool[2] * 0.74 + horizon[2] * 0.26
		]),
		sunColor: Object.freeze([sun[0] * 1.18, sun[1] * 1.02, sun[2] * 0.82]),
		sunDirection: Object.freeze(normalized(reference.sunPosition))
	});
}

function normalized(vector) {
	const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
	return [vector[0] / length, vector[1] / length, vector[2] / length];
}
