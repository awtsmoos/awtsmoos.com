// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFoundationServices.js
 * @description Creates third-person default camera, full-quality renderer, input, and batching.
 * RESPONSIBILITY: establish the default world view and lossless rendering services.
 * NON-RESPONSIBILITY: this module never changes FPS, lowers fidelity, or owns camera switching UI.
 * ARCHITECTURE: Malchus receives camera and renderer while Tiferes preserves equivalent forms.
 * OROS AND KEILIM: immersive play is ohr; orbit, canvas, controls, and batches are keilim.
 * The Awtsmoos recreates the whole valley each instant; Awtsmoos.com begins with the player
 * visibly inside the world while allowing the UI to reveal first-person sight when requested.
 */

import { PerspectiveCamera, Scene } from '../../../light-three-gltf/tiny-runtime.js';
import { StaticOpaqueBatcher } from '../../../light-three-gltf/tiny-static-opaque-batcher.js';
import { TinyWebGLRenderer } from '../../../light-three-gltf/tiny-webgl-renderer.js';
import { CameraOrbitController } from '../camera/CameraOrbitController.js';
import { JumpButton } from '../input/JumpButton.js';
import { MobileJoystick } from '../input/MobileJoystick.js';
import { UiEventSystem } from '../input/UiEventSystem.js';
import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';

export function createEretzFoundationServices(hosts, qualityProfile) {
	const scene = new Scene();
	const camera = new PerspectiveCamera(
		78,
		innerWidth / innerHeight,
		0.035,
		1600
	);
	const renderer = new TinyWebGLRenderer({ canvas: hosts.canvas });
	renderer.options.culling = true;
	renderer.options.defaultRenderDistance = qualityProfile.renderDistance;
	renderer.options.staticBatcher = new StaticOpaqueBatcher();
	renderer.setClearColor(0.36, 0.56, 0.72, 1);
	renderer.setEnvironment({
		ambient: [0.34, 0.34, 0.31],
		exposure: 1.16,
		fogColor: [0.61, 0.70, 0.73],
		fogFar: qualityProfile.renderDistance * 1.08,
		fogNear: qualityProfile.renderDistance * 0.32,
		sunColor: [1.42, 1.08, 0.78],
		sunDirection: [-0.42, 0.76, 0.49]
	});
	const bus = new AwtsmoosEventBus();
	const input = new UiEventSystem(hosts.canvas).install(bus);
	const joystick = new MobileJoystick(hosts.joystickHost);
	const jumpButton = new JumpButton(hosts.jumpHost);
	const orbit = new CameraOrbitController(hosts.canvas, {
		distance: 16.5,
		eyeForward: 0.24,
		max: 220,
		min: 2.4,
		mode: 'orbit',
		pitch: 0.21,
		yaw: Math.PI
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
