//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file NativeGridGame3DRenderer.js
 * @description Projects canonical 2D grid state as reusable native 3D meshes with
 * procedural particles, without external rendering libraries and without owning gameplay rules.
 *
 * Architectural invariants:
 * - Matrix input is read-only; simulation remains authoritative elsewhere.
 * - Cell meshes share one procedural geometry and are reused across every frame.
 * - Particle motion is decorative, bounded, and paused when 3D mode is inactive.
 * - DPR is capped at 2 and disposal releases RAF plus GPU resources.
 */
import { createNativeRenderer } from '../../adapters/native/renderer.js';
import { Scene } from '../../runtime/native/tiny-runtime.js';
import {
	applyNativeGridMatrix,
	createNativeGridPool
} from './native-grid-pool.js';
import {
	createNativeGridCamera,
	createNativeGridParticles
} from './native-grid-scene.js';

export class NativeGridGame3DRenderer {
	constructor(canvas, options) {
		this.canvas = canvas;
		this.rows = options.rows;
		this.columns = options.columns;
		this.renderer = createNativeRenderer(canvas, { alpha: true, antialias: true });
		this.scene = new Scene();
		this.camera = createNativeGridCamera(this.rows, this.columns);
		this.pool = createNativeGridPool(options);
		this.particles = createNativeGridParticles(this.rows, this.columns);
		this.scene.add(this.particles);
		this.scene.add(this.pool.group);
		this.active = false;
		this.frameId = 0;
		this.startedAt = 0;
		this.renderer.setClearColor(0.02, 0.035, 0.09, 1);
	}

	/** Apply one canonical grid matrix without changing its ownership. */
	update(matrix) {
		applyNativeGridMatrix(this.pool, matrix);
		if (this.active) {
			this.renderer.render(this.scene, this.camera);
		}
	}

	/** Enable or disable the optional visual projection. */
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

	/** Match CSS size with a strict DPR ceiling. */
	resize() {
		const ratio = Math.min(2, globalThis.devicePixelRatio || 1);
		const width = Math.max(1, Math.round(this.canvas.clientWidth * ratio));
		const height = Math.max(1, Math.round(this.canvas.clientHeight * ratio));
		this.renderer.setSize(width, height);
		this.camera.aspect = width / height;
	}

	/** Animate only decorative particles while authoritative cells remain fixed. */
	frame() {
		if (!this.active) {
			return;
		}
		const elapsed = (performance.now() - this.startedAt) / 1000;
		const halfYaw = elapsed * 0.07;
		this.particles.quaternion.set(0, Math.sin(halfYaw), 0, Math.cos(halfYaw));
		this.renderer.render(this.scene, this.camera);
		this.frameId = requestAnimationFrame(() => this.frame());
	}

	/** Release optional presentation resources permanently. */
	dispose() {
		this.setActive(false);
		this.renderer.dispose();
	}
}
