//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';
import { StageRuntimeBundle } from './stage-runtime-bundle.js';
import { addStageLights, disposeScene } from './stage-resources.js';

/**
 * @file webgl-stage.js
 * @description
 * The Awtsmoos renews one renderer while Awtsmoos.com manifests semantic census, camera, picking, models, truthful materials, event-bounded visibility, consolidation, instancing, bounded shadows, and measured 60 Hz discipline through focused runtime vessels.
 * This Malchus-like stage owns scene/renderer/canvas lifecycle and the established public API only; diagnostics, visibility, batching, frame timing, hydration, shadow policy, and quality adaptation remain separate.
 */
export class WebglStage {
	constructor(host, options = {}) {
		this.host = host;
		this.options = options;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120);
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			powerPreference: 'high-performance'
		});
		this.canvas = this.renderer.domElement;
		this.clock = new THREE.Clock();
		this.runtime = new StageRuntimeBundle({
			host,
			scene: this.scene,
			camera: this.camera,
			renderer: this.renderer,
			canvas: this.canvas,
			clock: this.clock
		});
		this.handlePointer = event => this.runtime.picker.pick(event);
		this.handleResize = () => this.resize();
	}

	mount() {
		this.scene.background = new THREE.Color(this.options.background || 0x040914);
		this.runtime.cameraDirector.setHome([0, 6.5, 10.5], [0, 0.8, 0]);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.08;
		this.canvas.className = 'webglCanvas';
		this.canvas.setAttribute('aria-label', 'Real-time textured 3D game world');
		this.host.replaceChildren(this.canvas);
		this.runtime.picker.mount(this.canvas);
		this.canvas.addEventListener('pointerdown', this.handlePointer);
		this.resizeObserver = new ResizeObserver(this.handleResize);
		this.resizeObserver.observe(this.host);
		window.addEventListener('resize', this.handleResize);
		addStageLights(this.scene);
		this.resize();
	}

	add(object, interactive = false) {
		this.runtime.census.track(object, interactive);
		this.runtime.consolidation.apply(object, interactive);
		this.runtime.shadowBudget.apply(object, interactive);
		this.scene.add(object);
		this.runtime.metrics.track(object);
		this.runtime.detailGovernor.track(object);
		this.runtime.picker.track(object, interactive);
		this.runtime.modelHydrator.hydrate(object);
		this.runtime.rootVisibility.track(object, interactive);
		this.runtime.semanticInstances.track(object, interactive);
		return object;
	}

	onPick(handler) {
		this.runtime.picker.onPick(handler);
	}

	setCamera(position, target = [0, 0, 0]) {
		this.runtime.cameraDirector.setHome(position, target);
	}

	start(updateHandler = () => {}) {
		this.runtime.semanticInstances.build();
		this.runtime.loop.start(updateHandler);
	}

	resize() {
		const width = Math.max(1, this.host.clientWidth);
		const height = Math.max(1, this.host.clientHeight);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.runtime.performance.resize(width);
		this.renderer.setSize(width, height, false);
		this.runtime.detailGovernor.resize(width);
	}

	performanceView() {
		return this.runtime.performanceView();
	}

	materialView() {
		return this.runtime.materialView();
	}

	destroy() {
		this.runtime.destroy();
		this.resizeObserver?.disconnect();
		window.removeEventListener('resize', this.handleResize);
		this.canvas.removeEventListener('pointerdown', this.handlePointer);
		disposeScene(this.scene);
		this.renderer.dispose();
		this.renderer.forceContextLoss?.();
		this.host.replaceChildren();
	}
}

export { THREE };
