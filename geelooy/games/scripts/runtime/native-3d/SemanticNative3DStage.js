//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file SemanticNative3DStage.js
 * @description Projects authoritative 2D state into native 3D while original gameplay keeps input ownership.
 * The Awtsmoos renews state before presentation; Awtsmoos.com gives actual state depth, native light, fog, and gameplay-linked sparks.
 */
import { createNativeRenderer } from '../../../../libs/awtsmoos-procedural-core/src/adapters/native/renderer.js';
import { PerspectiveCamera, Scene } from '../../../../libs/awtsmoos-procedural-core/src/runtime/native/tiny-runtime.js';
import { CanvasStateProjector } from './CanvasStateProjector.js';
import { DomStateProjector } from './DomStateProjector.js';
import { findLiveProjectionSource } from './live-source.js';
import { SemanticMeshPool } from './SemanticMeshPool.js';
import { StateSparks } from './StateSparks.js';

export class SemanticNative3DStage {
	constructor(documentObject = document) {
		this.document = documentObject;
		this.canvas = documentObject.createElement('canvas');
		this.canvas.className = 'awtsmoosNative3DBackdrop';
		this.canvas.setAttribute('aria-hidden', 'true');
		this.renderer = createNativeRenderer(this.canvas, { alpha: false, antialias: true, cacheGlState: true });
		this.scene = new Scene();
		this.camera = new PerspectiveCamera(50, 1, 0.1, 100);
		this.camera.position.set(0, 0, 13);
		this.camera.target = [0, 0, 0];
		this.pool = new SemanticMeshPool();
		this.sparks = new StateSparks(24, this.prefersReducedMotion());
		this.scene.add(this.pool.group, this.sparks.group);
		this.configureEnvironment();
		this.active = false;
		this.destroyed = false;
		this.lastSample = 0;
		this.lastFrame = 0;
	}
	mount() {
		this.document.body.append(this.canvas);
		this.frame = time => this.renderFrame(time);
		requestAnimationFrame(this.frame);
	}
	setActive(active) {
		this.active = Boolean(active);
		this.canvas.hidden = !this.active;
	}
	resolveSource() {
		if (this.source?.element?.isConnected) return;
		this.source = findLiveProjectionSource(this.document);
		this.projector = this.source?.kind === 'canvas'
			? new CanvasStateProjector(this.source.element, this.document)
			: this.source?.kind === 'dom' ? new DomStateProjector(this.source.element) : null;
	}
	renderFrame(time) {
		if (this.destroyed) return;
		const delta = Math.min(0.05, Math.max(0, time - this.lastFrame) / 1000);
		this.lastFrame = time;
		if (this.active) {
			this.resolveSource();
			this.resize();
			if (this.projector && time - this.lastSample >= 90) this.sample(time);
			this.sparks.update(delta);
			this.renderer.render(this.scene, this.camera);
		}
		requestAnimationFrame(this.frame);
	}
	sample(time) {
		this.lastSample = time;
		const states = this.projector.sample();
		this.pool.update(states);
		this.sparks.spawn(states);
		this.canvas.dataset.native3dProjection = this.source.kind;
		this.canvas.dataset.native3dEntityCount = String(states.length);
		this.canvas.dataset.native3dChangeCount = String(states.filter(state => state.changed).length);
	}
	resize() {
		const rect = this.source?.element?.getBoundingClientRect?.();
		if (!rect?.width || !rect?.height) return;
		Object.assign(this.canvas.style, {
			left: `${rect.left}px`,
			top: `${rect.top}px`,
			width: `${rect.width}px`,
			height: `${rect.height}px`
		});
		const ratio = Math.min(globalThis.devicePixelRatio || 1, 1.5);
		this.renderer.setSize(
			Math.max(1, Math.round(rect.width * ratio)),
			Math.max(1, Math.round(rect.height * ratio))
		);
		this.camera.aspect = rect.width / rect.height;
	}
	configureEnvironment() {
		this.renderer.setClearColor(0.012, 0.025, 0.07, 1);
		this.renderer.setEnvironment({
			ambient: [0.28, 0.34, 0.5], sunDirection: [-0.4, -0.8, -0.5],
			sunColor: [1, 0.9, 0.7], fogColor: [0.012, 0.025, 0.07],
			fogNear: 12, fogFar: 34, exposure: 1.1
		});
	}
	prefersReducedMotion() {
		return Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
	}
	destroy() {
		this.destroyed = true;
		this.active = false;
		this.renderer.dispose();
		this.canvas.remove();
	}
}
