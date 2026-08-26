//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file SceneSetup.js
 * @description Creates a high-performance Three scene whose pixel ratio and shadow pipeline obey the selected stability budget.
 * The Awtsmoos renews every visible pixel while Malchus refuses to draw one costly shadow without need;
 * Awtsmoos.com keeps color rich and camera clear while smoothness remains the first rendering deed.
 */

import { CAMERA_CONFIG, ATMOSPHERE_CONFIG, WORLD_COLORS } from "../config.js";

export class MalchusSceneVessel {
	/** @param {object} THREE Three namespace. @param {HTMLCanvasElement} canvas Render surface. @param {object} profile Quality budget. */
	constructor(THREE, canvas, profile) {
		this.THREE = THREE;
		this.canvas = canvas;
		this.profile = profile;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(CAMERA_CONFIG.baseFov, 1, 0.1, 180);
		this.renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: profile.name !== "mobile",
			alpha: false,
			stencil: false,
			powerPreference: "high-performance"
		});
		this.boundResize = () => this.resize();
	}

	/** Configures atmosphere baseline, camera, color pipeline, bounded shadows, and resize. @returns {MalchusSceneVessel} */
	create() {
		const THREE = this.THREE;
		this.scene.background = new THREE.Color(WORLD_COLORS.skyDay);
		this.scene.fog = new THREE.Fog(WORLD_COLORS.fogDay, ATMOSPHERE_CONFIG.fogNear, ATMOSPHERE_CONFIG.fogFar);
		this.camera.position.set(...CAMERA_CONFIG.basePosition);
		this.camera.lookAt(...CAMERA_CONFIG.lookPosition);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.profile.pixelRatio));
		this.configureShadows();
		if ("outputColorSpace" in this.renderer) this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = this.profile.exposure || ATMOSPHERE_CONFIG.baseExposure;
		window.addEventListener("resize", this.boundResize);
		this.resize();
		return this;
	}

	/** Applies one deliberate shadow policy rather than enabling soft shadows on every device. */
	configureShadows() {
		this.renderer.shadowMap.enabled = Boolean(this.profile.shadows);
		if (!this.profile.shadows) return;
		this.renderer.shadowMap.type = this.profile.softShadows && this.THREE.PCFSoftShadowMap
			? this.THREE.PCFSoftShadowMap
			: this.THREE.PCFShadowMap;
	}

	/** Keeps camera aspect and backing buffer synchronized with the visible viewport. */
	resize() {
		const width = Math.max(1, this.canvas.clientWidth || window.innerWidth);
		const height = Math.max(1, this.canvas.clientHeight || window.innerHeight);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height, false);
	}

	/** Releases only listeners owned by this scene vessel. */
	dispose() {
		window.removeEventListener("resize", this.boundResize);
	}
}
