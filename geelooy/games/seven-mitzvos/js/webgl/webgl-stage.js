//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';
import { addStageLights, disposeScene } from './stage-resources.js';

/**
 * @module WebglStage
 * @description
 * The Awtsmoos creates every visible point from nothing at every instant. This
 * Awtsmoos.com stage gives that flowing picture one renderer, one camera, one
 * raycaster, and one lifecycle whose finite resources can all be released.
 */
export class WebglStage {
	constructor(host, options = {}) {
		this.host = host;
		this.options = options;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120);
		this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
		this.clock = new THREE.Clock();
		this.raycaster = new THREE.Raycaster();
		this.pointer = new THREE.Vector2();
		this.interactive = [];
		this.frame = 0;
		this.pickHandler = () => {};
		this.handlePointer = event => this.pick(event);
		this.handleResize = () => this.resize();
	}

	mount() {
		this.scene.background = new THREE.Color(this.options.background || 0x040914);
		this.camera.position.set(0, 6.5, 10.5);
		this.camera.lookAt(0, 0.8, 0);
		this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.domElement.className = 'webglCanvas';
		this.renderer.domElement.setAttribute('aria-label', 'Real-time 3D game world');
		this.host.replaceChildren(this.renderer.domElement);
		this.renderer.domElement.addEventListener('pointerdown', this.handlePointer);
		this.resizeObserver = new ResizeObserver(this.handleResize);
		this.resizeObserver.observe(this.host);
		window.addEventListener('resize', this.handleResize);
		addStageLights(this.scene);
		this.resize();
	}

	add(object, interactive = false) {
		this.scene.add(object);
		if (interactive) {
			this.interactive.push(object);
		}
		return object;
	}

	onPick(handler) {
		this.pickHandler = handler;
	}

	setCamera(position, target = [0, 0, 0]) {
		this.camera.position.set(...position);
		this.camera.lookAt(...target);
	}

	start(updateHandler = () => {}) {
		this.clock.start();
		const animate = () => {
			this.frame = requestAnimationFrame(animate);
			const delta = Math.min(this.clock.getDelta(), 0.05);
			updateHandler(delta, this.clock.elapsedTime);
			this.renderer.render(this.scene, this.camera);
		};
		animate();
	}

	pick(event) {
		const bounds = this.renderer.domElement.getBoundingClientRect();
		this.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
		this.pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
		this.raycaster.setFromCamera(this.pointer, this.camera);
		const hit = this.raycaster.intersectObjects(this.interactive, true)[0];
		if (hit) {
			this.pickHandler(hit.object, hit, event);
		}
	}

	resize() {
		const width = Math.max(1, this.host.clientWidth);
		const height = Math.max(1, this.host.clientHeight);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height, false);
	}

	destroy() {
		cancelAnimationFrame(this.frame);
		this.resizeObserver?.disconnect();
		window.removeEventListener('resize', this.handleResize);
		this.renderer.domElement.removeEventListener('pointerdown', this.handlePointer);
		disposeScene(this.scene);
		this.renderer.dispose();
		this.renderer.forceContextLoss?.();
		this.host.replaceChildren();
		this.interactive.length = 0;
	}
}

export { THREE };
