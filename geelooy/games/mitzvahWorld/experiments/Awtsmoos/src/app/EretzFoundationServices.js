// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFoundationServices.js
 * @description Creates camera, renderer, input, orbit, and event vessels for one quality profile.
 * The Awtsmoos renews every interface between player and valley; Awtsmoos.com binds
 * those oros into measured keilim whose distance policy matches the chosen device tier.
 */

import { PerspectiveCamera, Scene } from '../../../light-three-gltf/tiny-runtime.js';
import { TinyWebGLRenderer } from '../../../light-three-gltf/tiny-webgl-renderer.js';
import { CameraOrbitController } from '../camera/CameraOrbitController.js';
import { JumpButton } from '../input/JumpButton.js';
import { MobileJoystick } from '../input/MobileJoystick.js';
import { UiEventSystem } from '../input/UiEventSystem.js';
import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';

export function createEretzFoundationServices(hosts, qualityProfile) {
	const scene = new Scene();
	const camera = new PerspectiveCamera(
		45,
		innerWidth / innerHeight,
		0.1,
		1600
	);
	const renderer = new TinyWebGLRenderer({ canvas: hosts.canvas });
	renderer.options.culling = true;
	renderer.options.defaultRenderDistance = qualityProfile.renderDistance;
	renderer.setClearColor(0.36, 0.56, 0.72, 1);
	renderer.setEnvironment({
		ambient: [0.20, 0.23, 0.25],
		sunDirection: [-0.42, 0.76, 0.49],
		sunColor: [1.26, 0.94, 0.68],
		fogColor: [0.52, 0.66, 0.72],
		fogNear: qualityProfile.renderDistance * 0.32,
		fogFar: qualityProfile.renderDistance * 1.08,
		exposure: 1.04
	});
	const bus = new AwtsmoosEventBus();
	const input = new UiEventSystem(hosts.canvas).install(bus);
	const joystick = new MobileJoystick(hosts.joystickHost);
	const jumpButton = new JumpButton(hosts.jumpHost);
	const orbit = new CameraOrbitController(hosts.canvas, {
		distance: 16.5,
		max: 220,
		min: 2.4,
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
