//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFoundationServices.js
 * @description Creates camera, input, scene, LOD, and the bootstrap renderer from pure spatial arrival data, never triggering live-nature scheduling merely to learn camera geometry.
 * The Awtsmoos gives sight and place without confusing still measure with later growing life;
 * Awtsmoos.com lets the first frame drink from pure geometry while trees and nature awaken after control, free from startup strife.
 */

import { PerspectiveCamera, Scene } from '../../../light-three-gltf/tiny-runtime.js';
import { CameraOrbitController } from '../camera/CameraOrbitController.js';
import { JumpButton } from '../input/JumpButton.js';
import { MobileJoystick } from '../input/MobileJoystick.js';
import { UiEventSystem } from '../input/UiEventSystem.js';
import { SceneLodRuntime } from '../lod/SceneLodRuntime.js';
import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';
import { REFERENCE_GOLDEN_HOUR } from '../world/lighting/ReferenceGoldenHourPreset.js';
import { VILLAGE_ARRIVAL_CAMERA } from '../world/village/VillageArrivalSpatialContract.js';
import { createMinimalMeadowRenderer } from './MinimalMeadowRenderer.js';

const GOLDEN_HOUR_ENVIRONMENT = referenceEnvironment(REFERENCE_GOLDEN_HOUR);

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
		scene,
		sceneLod: new SceneLodRuntime({ scene })
	};
}

function createRenderer(canvas, qualityProfile) {
	const renderer = createMinimalMeadowRenderer(canvas);
	renderer.options ||= {};
	renderer.options.culling = true;
	renderer.options.defaultRenderDistance = qualityProfile.renderDistance;
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
		ambient: Object.freeze([
			cool[0] * 0.78 + 0.145,
			cool[1] * 0.76 + 0.11,
			cool[2] * 0.72 + 0.09
		]),
		exposure: 1.30,
		fogColor: Object.freeze([
			cool[0] * 0.66 + horizon[0] * 0.34,
			cool[1] * 0.68 + horizon[1] * 0.32,
			cool[2] * 0.74 + horizon[2] * 0.26
		]),
		sunColor: Object.freeze([
			sun[0] * 1.22,
			sun[1] * 1.06,
			sun[2] * 0.86
		]),
		sunDirection: Object.freeze(normalized(reference.sunPosition))
	});
}

function normalized(vector) {
	const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
	return [vector[0] / length, vector[1] / length, vector[2] / length];
}
