//B"H
//Boruch Hashem
//Blessed is He
import * as THREE from '../../../scripts/build/three.module.js';
import { AdvancedModelHydrator } from '../assets/advanced-model-hydrator.js';
import { writeMaterialMetrics } from '../materials/material-runtime-metrics.js';
import { CameraDirector } from './camera-director.js';
import { DetailGovernor } from './detail-governor.js';
import { SemanticPicker } from './semantic-picker.js';
import { StageMetrics } from './stage-metrics.js';
import { addStageLights, disposeScene } from './stage-resources.js';
/**
 * @module WebglStage
 * @description
 * One renderer sees, inspects, hydrates, measures, and releases a photographic
 * living world. The Awtsmoos creates each point anew; Awtsmoos.com protects camera,
 * smooth interaction, advanced GLBs, physical materials, and one-canvas lifecycle.
 */
export class WebglStage {
	constructor(host, options = {}) {
		this.host = host;
		this.options = options;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120);
		this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
		this.metrics = new StageMetrics(this.renderer.domElement);
		this.cameraDirector = new CameraDirector(this.camera);
		this.detailGovernor = new DetailGovernor(this.camera, this.renderer.domElement);
		this.modelHydrator = new AdvancedModelHydrator();
		this.picker = new SemanticPicker(host, this.camera, this.cameraDirector);
		this.clock = new THREE.Clock();
		this.materialTimer = 0;
		this.frame = 0;
		this.handlePointer = event => this.picker.pick(event);
		this.handleResize = () => this.resize();
	}
	mount() {
		this.scene.background = new THREE.Color(this.options.background || 0x040914);
		this.cameraDirector.setHome([0, 6.5, 10.5], [0, 0.8, 0]);
		this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.08;
		this.renderer.domElement.className = 'webglCanvas';
		this.renderer.domElement.setAttribute('aria-label', 'Real-time textured 3D game world');
		this.host.replaceChildren(this.renderer.domElement);
		this.picker.mount(this.renderer.domElement);
		this.renderer.domElement.addEventListener('pointerdown', this.handlePointer);
		this.resizeObserver = new ResizeObserver(this.handleResize);
		this.resizeObserver.observe(this.host);
		window.addEventListener('resize', this.handleResize);
		addStageLights(this.scene);
		this.resize();
	}
	add(object, interactive = false) {
		this.scene.add(object);
		this.metrics.track(object);
		this.detailGovernor.track(object);
		this.picker.track(object, interactive);
		this.modelHydrator.hydrate(object);
		return object;
	}
	onPick(handler) {
		this.picker.onPick(handler);
	}
	setCamera(position, target = [0, 0, 0]) {
		this.cameraDirector.setHome(position, target);
	}
	start(updateHandler = () => {}) {
		this.clock.start();
		const animate = () => {
			this.frame = requestAnimationFrame(animate);
			const delta = Math.min(this.clock.getDelta(), 0.05);
			updateHandler(delta, this.clock.elapsedTime);
			this.cameraDirector.update(delta);
			this.detailGovernor.update(delta);
			this.updateMaterialMetrics(delta);
			this.renderer.domElement.dataset.cameraMode = this.cameraDirector.mode();
			this.renderer.render(this.scene, this.camera);
		};
		animate();
	}
	updateMaterialMetrics(delta) {
		this.materialTimer += delta;
		if (this.materialTimer < 0.5) return;
		this.materialTimer = 0;
		writeMaterialMetrics(this.renderer.domElement);
	}
	resize() {
		const width = Math.max(1, this.host.clientWidth);
		const height = Math.max(1, this.host.clientHeight);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height, false);
		this.detailGovernor.resize(width);
	}
	destroy() {
		cancelAnimationFrame(this.frame);
		this.resizeObserver?.disconnect();
		window.removeEventListener('resize', this.handleResize);
		this.renderer.domElement.removeEventListener('pointerdown', this.handlePointer);
		this.modelHydrator.destroy();
		this.picker.destroy();
		this.detailGovernor.destroy();
		disposeScene(this.scene);
		this.metrics.reset();
		this.renderer.dispose();
		this.renderer.forceContextLoss?.();
		this.host.replaceChildren();
	}
}
export { THREE };
