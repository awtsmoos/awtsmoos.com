// B"H
import {
	PerspectiveCamera,
	Scene
} from '../../../light-three-gltf/tiny-runtime.js';
import { TinyWebGLRenderer } from '../../../light-three-gltf/tiny-webgl-renderer.js';
import { Aabb } from '../math/Aabb.js';
import { AwtsmoosOctree } from '../collision/AwtsmoosOctree.js';
import { UiEventSystem } from '../input/UiEventSystem.js';
import { MobileJoystick } from '../input/MobileJoystick.js';
import { JumpButton } from '../input/JumpButton.js';
import { CameraOrbitController } from '../camera/CameraOrbitController.js';
import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';
import { createGroundSampler } from '../world/GroundPlacementSystem.js';
import { createObstacleField } from '../world/ObstacleField.js';
import { createSky3D } from '../world/Sky3D.js';
import {
	createTerrainPackage,
	heightAt
} from '../world/Terrain3D.js';
import { WorldGround } from '../world/WorldGround.js';
import { loadEretzAssets } from './EretzAssetLoader.js';

/** Creates the static world before actors begin moving through it. */
export async function createEretzWorldFoundation(hosts) {
	const scene = new Scene();
	const camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1600);
	const renderer = new TinyWebGLRenderer({ canvas: hosts.canvas });
	const bus = new AwtsmoosEventBus();
	const input = new UiEventSystem(hosts.canvas).install(bus);
	const joystick = new MobileJoystick(hosts.joystickHost);
	const jumpButton = new JumpButton(hosts.jumpHost);
	const orbit = new CameraOrbitController(hosts.canvas, {
		distance: 16.5,
		pitch: 0.21,
		yaw: Math.PI,
		min: 2.4,
		max: 220
	});
	const loaded = await loadEretzAssets();
	const phaseOneGround = createGroundSampler({ terrainHeightAt: heightAt });
	const obstacles = createObstacleField(loaded.assets, phaseOneGround);
	const terrain = createTerrainPackage(obstacles, loaded.grassImage, null, phaseOneGround);
	const mainOctree = buildTriangleOctree(terrain.colliders);
	const groundSampler = phaseOneGround.withOctree(mainOctree);
	const ground = new WorldGround({ terrainHeightAt: terrain.heightAt, octree: mainOctree });
	terrain.stats.groundSampler = groundSampler.stats().mode;
	scene.add(createSky3D());
	scene.add(terrain.group);
	return {
		...hosts,
		...loaded,
		scene,
		camera,
		renderer,
		bus,
		input,
		joystick,
		jumpButton,
		orbit,
		phaseOneGround,
		obstacles,
		terrain,
		mainOctree,
		groundSampler,
		ground
	};
}

function buildTriangleOctree(colliders) {
	const octree = new AwtsmoosOctree(Aabb.centerSize(
		{ x: 0, y: 0, z: 0 },
		{ x: 780, y: 180, z: 780 }
	));
	for (const triangle of colliders) {
		octree.insert(triangle);
	}
	return octree;
}
