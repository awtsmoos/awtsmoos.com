//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file scene.js
 * @description Builds the Rambam celestial lesson through Awtsmoos Procedural Core's native WebGL runtime.
 * The Awtsmoos renews earth, sun, observer, and light beyond every finite engine; Awtsmoos.com
 * keeps this authored study native, interactive, renderer-neutral, and free of forbidden dependencies.
 */
import { createNativeRenderer } from "/libs/awtsmoos-procedural-core/src/adapters/native/renderer.js";
import {
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	Scene
} from "/libs/awtsmoos-procedural-core/src/runtime/native/tiny-runtime.js";
import {
	CAMERA_FAR,
	CAMERA_FOV,
	CAMERA_NEAR,
	EARTH_RADIUS,
	GROUND_SIZE,
	MAX_DEVICE_PIXEL_RATIO,
	SUN_RADIUS
} from "./constants.js";
import { createNativeGeometry } from "./native-geometry.js";
import { NativeOrbitControls } from "./native-orbit-controls.js";

const COLORS = Object.freeze({
	earth: [0.08, 0.34, 0.82, 1],
	ground: [0.06, 0.28, 0.12, 1],
	sun: [1, 0.78, 0.08, 1]
});

/**
 * Create the complete interactive celestial scene in one supplied host.
 * @param {HTMLElement} container Full-screen scene host.
 * @returns {{scene:Scene,camera:PerspectiveCamera,renderer:object,controls:NativeOrbitControls,sun:Mesh}}
 */
export function createSunScene(container) {
	const canvas = document.createElement("canvas");
	canvas.setAttribute("aria-label", "Interactive native 3D sun orbit visualization");
	container.append(canvas);
	const renderer = createNativeRenderer(canvas, { alpha: false, antialias: true });
	renderer.setClearColor(0.008, 0.02, 0.04, 1);
	renderer.setEnvironment({
		ambient: [0.34, 0.36, 0.42],
		sunDirection: [0.58, 0.58, 0.58],
		sunColor: [1, 0.94, 0.78],
		exposure: 1.15
	});
	const scene = new Scene();
	const camera = new PerspectiveCamera(CAMERA_FOV, 1, CAMERA_NEAR, CAMERA_FAR);
	camera.position.set(0, 50, 100);
	camera.target = [0, 0, 0];
	const ground = createGround();
	const earth = createSphere(EARTH_RADIUS, COLORS.earth);
	earth.position.set(0, 2, 0);
	const sun = createSphere(SUN_RADIUS, COLORS.sun);
	scene.add(ground, earth, sun);
	const controls = new NativeOrbitControls(camera, canvas);
	resizeSunScene(camera, renderer);
	return { scene, camera, renderer, controls, sun };
}

/** Create the authored square ground as a thin procedural cube. */
function createGround() {
	const geometry = createNativeGeometry("cube", { size: 1 });
	const material = new MeshStandardMaterial({ color: COLORS.ground });
	const ground = new Mesh(geometry, material);
	ground.scale.set(GROUND_SIZE, 0.08, GROUND_SIZE);
	ground.position.set(0, -0.04, 0);
	return ground;
}

/** Create one smooth procedural sphere with a native material. */
function createSphere(radius, color) {
	const geometry = createNativeGeometry("sphere", {
		radius,
		widthSegments: 32,
		heightSegments: 32,
		smooth: true
	});
	return new Mesh(geometry, new MeshStandardMaterial({ color }));
}

/** Preserve authored CSS size while capping intrinsic pixels for mobile GPU safety. */
export function resizeSunScene(camera, renderer) {
	const canvas = renderer.canvas;
	const width = Math.max(1, canvas.clientWidth || globalThis.innerWidth || 1);
	const height = Math.max(1, canvas.clientHeight || globalThis.innerHeight || 1);
	const pixelRatio = Math.min(globalThis.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
	camera.aspect = width / height;
	renderer.setSize(width * pixelRatio, height * pixelRatio);
}
