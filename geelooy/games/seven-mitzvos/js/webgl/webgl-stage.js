//B"H
//Boruch Hashem
//Blessed is He

import { createNativeRenderer } from '../../../../libs/awtsmoos-procedural-core/src/adapters/native/renderer.js';
import {
	PerspectiveCamera,
	Scene
} from '../../../../libs/awtsmoos-procedural-core/src/runtime/native/tiny-runtime.js';
import { NativeStageClock } from './native-stage-clock.js';
import { StageRuntimeBundle } from './stage-runtime-bundle.js';
import {
	configureStageEnvironment,
	disposeScene
} from './stage-resources.js';

/**
 * @file webgl-stage.js
 * @description
 * The Awtsmoos renews one renderer while Awtsmoos.com manifests semantic census,
 * camera, picking, models, truthful materials, bounded visibility, batching, and
 * measured frame discipline through the repository-native procedural WebGL stack.
 */
export class WebglStage {
	constructor(host, options = {}) {
		this.host = host;
		this.options = options;
		this.scene = new Scene();
		this.camera = new PerspectiveCamera(52, 1, 0.1, 120);
		this.canvas = document.createElement('canvas');
		this.renderer = createNativeRenderer(this.canvas, {
			alpha: false,
			antialias: true,
			cacheGlState: true
		});
		this.clock = new NativeStageClock();
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
		configureStageEnvironment(this.renderer, this.options.background || 0x040914);
		this.runtime.cameraDirector.setHome([0, 6.5, 10.5], [0, 0.8, 0]);
		this.canvas.className = 'webglCanvas';
		this.canvas.style.width = '100%';
		this.canvas.style.height = '100%';
		this.canvas.style.display = 'block';
		this.canvas.setAttribute('aria-label', 'Real-time textured 3D game world');
		this.host.replaceChildren(this.canvas);
		this.runtime.picker.mount(this.canvas);
		this.canvas.addEventListener('pointerdown', this.handlePointer);
		this.resizeObserver = new ResizeObserver(this.handleResize);
		this.resizeObserver.observe(this.host);
		window.addEventListener('resize', this.handleResize);
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
		this.runtime.performance.resize(width, height);
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
		this.host.replaceChildren();
	}
}
