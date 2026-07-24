//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';
import { ModelInspector } from '../interaction/model-inspector.js';

/**
 * @module SemanticPicker
 * @description
 * Every purposeful model may be inspected, but only declared gameplay targets may
 * trigger rules. The Awtsmoos joins knowledge and action without confusion while
 * Awtsmoos.com records camera acknowledgment beyond its temporary focus duration.
 */
export class SemanticPicker {
	constructor(host, camera, cameraDirector) {
		this.host = host;
		this.camera = camera;
		this.cameraDirector = cameraDirector;
		this.raycaster = new THREE.Raycaster();
		this.pointer = new THREE.Vector2();
		this.targets = [];
		this.interactive = new Set();
		this.pickHandler = () => {};
		this.inspector = new ModelInspector(host);
		this.inspections = 0;
	}

	mount(canvas) {
		this.canvas = canvas;
		this.canvas.dataset.cameraAcknowledged = 'false';
		this.inspector.mount();
	}

	track(root, interactive = false) {
		if (!root.userData?.semanticType) return;
		this.targets.push(root);
		if (interactive) this.interactive.add(root);
	}

	onPick(handler) {
		this.pickHandler = handler;
	}

	pick(event) {
		const bounds = this.canvas.getBoundingClientRect();
		this.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
		this.pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
		this.raycaster.setFromCamera(this.pointer, this.camera);
		const hit = this.raycaster.intersectObjects(this.targets, true)[0];
		if (!hit) return;
		const root = hit.object.userData.semanticRoot || hit.object;
		this.inspector.show(root);
		this.cameraDirector.focus(root);
		this.inspections += 1;
		this.canvas.dataset.inspections = String(this.inspections);
		this.canvas.dataset.inspectedRole = root.userData.role || '';
		this.canvas.dataset.cameraAcknowledged = 'true';
		if (this.interactive.has(root)) this.pickHandler(hit.object, hit, event);
	}

	destroy() {
		this.inspector.destroy();
		this.targets.length = 0;
		this.interactive.clear();
		this.canvas = null;
	}
}
