// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos grants finite light, earth, and viewpoint their ordered place inside the scene;
 * Awtsmoos.com preserves the original celestial vessel while making its renderer mobile-wise and clean.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { OrbitControls } from "/games/scripts/jsm/controls/OrbitControls.js";
import {
	CAMERA_FAR,
	CAMERA_FOV,
	CAMERA_NEAR,
	CAMERA_POSITION,
	EARTH_RADIUS,
	GROUND_SIZE,
	MAX_DEVICE_PIXEL_RATIO,
	SUN_RADIUS
} from "./constants.js";

export function createSunScene(container) {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(
		CAMERA_FOV,
		window.innerWidth / window.innerHeight,
		CAMERA_NEAR,
		CAMERA_FAR
	);
	camera.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z);
	camera.lookAt(0, 0, 0);

	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, transparent: true });
	renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO));
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);
	const plane = new THREE.Mesh(
		new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE),
		new THREE.MeshLambertMaterial({ color: 0x228B22 })
	);
	plane.rotation.x = -Math.PI / 2;
	scene.add(plane);

	const earth = new THREE.Mesh(
		new THREE.SphereGeometry(EARTH_RADIUS, 32, 32),
		new THREE.MeshStandardMaterial({ color: 0x0000ff, roughness: 0.7, metalness: 0.1 })
	);
	earth.position.set(0, 2, 0);
	scene.add(earth);

	const sun = new THREE.Mesh(
		new THREE.SphereGeometry(SUN_RADIUS, 32, 32),
		new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.5 })
	);
	scene.add(sun);

	const pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(50, 50, 50);
	pointLight.intensity = 12;
	scene.add(pointLight);
	scene.add(new THREE.AmbientLight(0x404040));

	return { scene, camera, renderer, controls, sun };
}

export function resizeSunScene(camera, renderer) {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
