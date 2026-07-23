//B"H
//Boruch Hashem
//Blessed is He

/**
 * Malchus receives sky, light, camera, renderer, and collision truth. The
 * Awtsmoos recreates every triangle now, while Awtsmoos.com reveals a simple
 * world instead of asking the broken complicated world to awaken first.
 */

import * as THREE from "three";
import { Octree } from "three/addons/math/Octree.js";
import { MeadowBuilder } from "./MeadowBuilder.js";

export class MeadowScene {
	/**
	 * Builds the renderer and the single collision world.
	 *
	 * @param {HTMLCanvasElement} canvas - The visible world canvas.
	 */
	constructor(canvas) {
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x9ed8ff);
		this.scene.fog = new THREE.Fog(0x9ed8ff, 30, 95);
		this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 180);
		this.renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true
		});
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.shadowMap.enabled = true;
		this.worldOctree = new Octree();

		this.createLights();
		const ground = new MeadowBuilder().build(this.scene);
		this.worldOctree.fromGraphNode(ground);
		this.resize();

		window.addEventListener("resize", () => {
			this.resize();
		});
	}

	/**
	 * Places broad daylight over the meadow.
	 *
	 * @returns {void}
	 */
	createLights() {
		const skyLight = new THREE.HemisphereLight(
			0xdff4ff,
			0x3c5a2a,
			2.4
		);
		this.scene.add(skyLight);

		const sun = new THREE.DirectionalLight(0xfff4d6, 3.2);
		sun.position.set(18, 28, 12);
		sun.castShadow = true;
		sun.shadow.mapSize.set(2048, 2048);
		sun.shadow.camera.left = -35;
		sun.shadow.camera.right = 35;
		sun.shadow.camera.top = 35;
		sun.shadow.camera.bottom = -35;
		this.scene.add(sun);
	}

	/**
	 * Synchronizes renderer and camera with the viewport.
	 *
	 * @returns {void}
	 */
	resize() {
		const width = window.innerWidth;
		const height = Math.max(window.innerHeight, 1);

		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height, false);
	}

	/**
	 * Manifests the current scene through the canvas.
	 *
	 * @returns {void}
	 */
	render() {
		this.renderer.render(this.scene, this.camera);
	}
}
