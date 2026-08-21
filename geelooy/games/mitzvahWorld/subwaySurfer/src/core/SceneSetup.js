// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews camera, fog, and rendered vessel before each ray can appear;
 * Awtsmoos.com gives quality-aware color and tone a bounded home, bright and clear.
 */

import { ATMOSPHERE_CONFIG, CAMERA_CONFIG, WORLD_COLORS } from "../config.js";

export class MalchusSceneVessel {
	/** @param {object} THREE Three.js namespace. @param {HTMLCanvasElement} canvas Render target. @param {object} profile Quality profile. */
	constructor(THREE, canvas, profile) {
		this.THREE = THREE;
		this.canvas = canvas;
		this.profile = profile;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(CAMERA_CONFIG.baseFov, 1, 0.1, 180);
		this.renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: profile.name !== "mobile",
			powerPreference: "high-performance"
		});
		this.boundResize = () => this.resize();
	}

	/** Configures atmosphere baseline, camera, color pipeline, shadows, and resize. @returns {MalchusSceneVessel} */
	create() {
		const THREE = this.THREE;
		this.scene.background = new THREE.Color(WORLD_COLORS.skyDay);
		this.scene.fog = new THREE.Fog(WORLD_COLORS.fogDay, ATMOSPHERE_CONFIG.fogNear, ATMOSPHERE_CONFIG.fogFar);
		this.camera.position.fromArray(CAMERA_CONFIG.basePosition);
		this.camera.lookAt(...CAMERA_CONFIG.lookPosition);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.profile.pixelRatio));
		this.renderer.shadowMap.enabled = true;
		if (THREE.PCFSoftShadowMap !== undefined) this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		if (THREE.SRGBColorSpace !== undefined) this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		if (THREE.ACESFilmicToneMapping !== undefined) this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = this.profile.exposure;
		this.resize();
		window.addEventListener("resize", this.boundResize);
		return this;
	}

	/** Updates canvas dimensions and camera projection after viewport changes. */
	resize() {
		const width = Math.max(1, this.canvas.clientWidth || window.innerWidth);
		const height = Math.max(1, this.canvas.clientHeight || window.innerHeight);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height, false);
	}

	/** Releases scene-owned browser and GPU resources. */
	dispose() {
		window.removeEventListener("resize", this.boundResize);
		this.renderer.dispose();
	}
}
