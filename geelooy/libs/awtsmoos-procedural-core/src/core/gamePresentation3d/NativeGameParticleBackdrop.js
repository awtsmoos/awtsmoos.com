//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file NativeGameParticleBackdrop.js
 * @description Owns one native procedural-core WebGL particle backdrop for optional
 * 3D game presentation without importing external rendering libraries or mutating game simulation.
 *
 * Architectural invariants:
 * - Rendering is decorative and can be disabled without changing gameplay truth.
 * - One batched particle mesh keeps visual intensity bounded to one primary draw call.
 * - DPR is capped at 2 and animation stops while presentation mode is inactive.
 * - Disposal cancels RAF ownership and releases all native GPU resources.
 */
import { createNativeRenderer } from '../../adapters/native/renderer.js';
import {
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	Scene
} from '../../runtime/native/tiny-runtime.js';
import { createNativeParticleGeometry } from './native-particle-geometry.js';

export class NativeGameParticleBackdrop {
	/** @param {HTMLCanvasElement} canvas Core-owned visual canvas. */
	constructor(canvas) {
		this.canvas = canvas;
		this.renderer = createNativeRenderer(canvas, { alpha: true, antialias: true });
		this.scene = new Scene();
		this.camera = createCamera();
		this.particles = createParticles();
		this.scene.add(this.particles);
		this.frameId = 0;
		this.active = false;
		this.startedAt = 0;
		this.renderer.setClearColor(0.015, 0.025, 0.07, 0);
	}

	/** Enable or disable presentation ownership without touching game state. */
	setActive(active) {
		const next = Boolean(active);
		if (this.active === next) {
			return;
		}
		this.active = next;
		if (next) {
			this.startedAt = performance.now();
			this.resize();
			this.frame();
			return;
		}
		cancelAnimationFrame(this.frameId);
		this.frameId = 0;
	}

	/** Match viewport pixels while respecting a strict DPR ceiling. */
	resize() {
		const ratio = Math.min(2, globalThis.devicePixelRatio || 1);
		const width = Math.max(1, Math.round(this.canvas.clientWidth * ratio));
		const height = Math.max(1, Math.round(this.canvas.clientHeight * ratio));
		this.renderer.setSize(width, height);
		this.camera.aspect = width / height;
	}

	/** Render one deterministic visual frame and schedule exactly one successor. */
	frame() {
		if (!this.active) {
			return;
		}
		const elapsed = (performance.now() - this.startedAt) / 1000;
		const halfYaw = elapsed * 0.055;
		this.particles.quaternion.set(0, Math.sin(halfYaw), 0, Math.cos(halfYaw));
		const pulse = 1 + Math.sin(elapsed * 1.4) * 0.025;
		this.particles.scale.set(pulse, pulse, pulse);
		this.renderer.render(this.scene, this.camera);
		this.frameId = requestAnimationFrame(() => this.frame());
	}

	/** Release RAF and GPU resources permanently. */
	dispose() {
		this.setActive(false);
		this.renderer.dispose();
	}
}

/** Create the camera shared by optional game backdrops. */
function createCamera() {
	const camera = new PerspectiveCamera(46, 1, 0.1, 100);
	camera.position.set(0.8, 0.6, 8.4);
	camera.target = [0, 0, 0];
	return camera;
}

/** Create one batched glowing particle vessel. */
function createParticles() {
	const geometry = createNativeParticleGeometry({ count: 96, spread: 13, seed: 770 });
	const material = new MeshStandardMaterial({
		name: 'AwtsmoosGameParticles',
		color: [1, 1, 1, 0.82],
		opacity: 0.82,
		alphaMode: 'BLEND',
		transparent: true,
		doubleSided: true
	});
	const mesh = new Mesh(geometry, material);
	mesh.name = 'AwtsmoosGameParticleField';
	return mesh;
}
