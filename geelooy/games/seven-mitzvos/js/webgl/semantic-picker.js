//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';
import { ModelInspector } from '../interaction/model-inspector.js';

/**
 * @file semantic-picker.js
 * @description
 * The Awtsmoos renews many render instances while one semantic identity remains the vessel of inspection and action;
 * Awtsmoos.com lets this picker resolve an InstancedMesh hit back to the original gameplay root without leaking renderer batching into interaction law.
 * Normal mesh callbacks preserve their existing object contract; instanced callbacks receive the resolved semantic root while the Three intersection remains intact.
 */
export class SemanticPicker {
	constructor(host, camera, cameraDirector) {
		this.host = host;
		this.camera = camera;
		this.cameraDirector = cameraDirector;
		this.raycaster = new THREE.Raycaster();
		this.pointer = new THREE.Vector2();
		this.targets = [];
		this.instanceBatches = [];
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
		if (!root.userData?.semanticType) {
			return;
		}
		this.targets.push(root);
		if (interactive) {
			this.interactive.add(root);
		}
	}

	/** Replaces generated semantic instance raycast targets after a batch build/rebuild. */
	setInstanceBatches(batches = []) {
		this.instanceBatches = batches.filter(batch => batch?.isInstancedMesh);
	}

	onPick(handler) {
		this.pickHandler = handler;
	}

	pick(event) {
		const bounds = this.canvas.getBoundingClientRect();
		this.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
		this.pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
		this.raycaster.setFromCamera(this.pointer, this.camera);
		const resolved = firstSemanticHit(
			this.raycaster.intersectObjects([...this.targets, ...this.instanceBatches], true)
		);
		if (!resolved) {
			return;
		}
		const { hit, root, callbackObject } = resolved;
		this.inspector.show(root);
		this.cameraDirector.focus(root);
		this.inspections += 1;
		this.canvas.dataset.inspections = String(this.inspections);
		this.canvas.dataset.inspectedRole = root.userData.role || '';
		this.canvas.dataset.cameraAcknowledged = 'true';
		if (this.interactive.has(root)) {
			this.pickHandler(callbackObject, hit, event);
		}
	}

	destroy() {
		this.inspector.destroy();
		this.targets.length = 0;
		this.instanceBatches.length = 0;
		this.interactive.clear();
		this.canvas = null;
	}
}

function firstSemanticHit(hits) {
	for (const hit of hits) {
		const batch = hit.object?.userData?.awtsmoosSemanticInstanceBatch;
		if (batch) {
			const root = hit.object.userData.instanceSemanticRoots?.[hit.instanceId];
			if (root?.userData?.semanticType) {
				return { hit, root, callbackObject: root };
			}
			continue;
		}
		const root = hit.object?.userData?.semanticRoot || hit.object;
		if (root?.userData?.semanticType) {
			return { hit, root, callbackObject: hit.object };
		}
	}
	return null;
}
