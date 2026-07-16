// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFoundationServices.js
 * @description Creates the close third-person camera and reference-lit renderer services.
 * RESPONSIBILITY: establish the default world view and lossless rendering services.
 * NON-RESPONSIBILITY: this module never changes FPS, lowers fidelity, or owns camera switching UI.
 * ARCHITECTURE: Malchus receives camera and renderer while Tiferes preserves equivalent forms.
 * OROS AND KEILIM: immersive play is ohr; orbit, canvas, controls, and batches are keilim.
 * The Awtsmoos recreates the whole valley each instant; Awtsmoos.com keeps the player near
 * the eye while one preset sun illuminates sky, haze, stone, water, and practical warmth.
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

const GOLDEN_HOUR_ENVIRONMENT = referenceEnvironment(REFERENCE_GOLDEN_HOUR);

export function createEretzFoundationServices(hosts, qualityProfile) {
	const scene = new Scene();
	const camera = new PerspectiveCamera(
		60,
		innerWidth / innerHeight,
		0.05,
		1600
	);
	const renderer = new TinyWebGLRenderer({ canvas: hosts.canvas });
	renderer.options.culling = true;
	renderer.options.defaultRenderDistance = qualityProfile.renderDistance;
	renderer.options.staticBatcher = new StaticOpaqueBatcher();
	renderer.setClearColor(...GOLDEN_HOUR_ENVIRONMENT.fogColor, 1);
	renderer.setEnvironment({
		...GOLDEN_HOUR_ENVIRONMENT,
		fogFar: qualityProfile.renderDistance * 1.08,
		fogNear: qualityProfile.renderDistance * 0.34
	});
	const bus = new AwtsmoosEventBus();
	const input = new UiEventSystem(hosts.canvas).install(bus);
	const joystick = new MobileJoystick(hosts.joystickHost);
	const jumpButton = new JumpButton(hosts.jumpHost);
	const orbit = new CameraOrbitController(hosts.canvas, {
		distance: 6.75,
		eyeForward: 0.32,
		max: 42,
		min: 1.65,
		mode: 'orbit',
		pitch: 0.29,
		yaw: Math.PI + 0.08
	});
	return {
		bus,
		camera,
		input,
		joystick,
		jumpButton,
		orbit,
		renderer,
		scene
	};
}

function referenceEnvironment(reference) {
	const cool = reference.coolShadow;
	const horizon = reference.horizonColor;
	const sun = reference.sunCore;
	return Object.freeze({
		ambient: Object.freeze([
			cool[0] * 0.66,
			cool[1] * 0.62,
			cool[2] * 0.58
		]),
		exposure: 1.1,
		fogColor: Object.freeze([
			cool[0] * 0.55 + horizon[0] * 0.45,
			cool[1] * 0.55 + horizon[1] * 0.45,
			cool[2] * 0.55 + horizon[2] * 0.45
		]),
		sunColor: Object.freeze([
			sun[0] * 1.32,
			sun[1] * 1.32,
			sun[2] * 1.32
		]),
		sunDirection: Object.freeze(normalized(reference.sunPosition))
	});
}

function normalized(vector) {
	const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
	return [vector[0] / length, vector[1] / length, vector[2] / length];
}
