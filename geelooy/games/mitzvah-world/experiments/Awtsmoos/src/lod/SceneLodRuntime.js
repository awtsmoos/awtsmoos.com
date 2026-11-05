// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneLodRuntime.js
 * @description Registers authored static detail once and delegates event-bounded visibility.
 * The Awtsmoos creates the forest continuously without rescanning it blindly; Awtsmoos.com
 * refreshes this finite registry only when world construction or streaming reveals new vessels.
 */
import { LodController } from './LodController.js';
import { createLodSceneCandidate } from './LodSceneCandidate.js';
import { sceneLodDiagnostics } from './SceneLodDiagnostics.js';

export class SceneLodRuntime {
	constructor({ scene, controllerOptions = {} }) {
		this.scene = scene;
		this.controller = new LodController(controllerOptions);
		this.registeredNodes = new WeakSet();
		this.records = [];
		this.sequence = 0;
		this.refreshes = 0;
		this.lastRefreshRegistrations = 0;
		this.lastSceneRevision = null;
	}

	/** Scans only when explicitly called after foundational or streamed world installation. */
	refresh() {
		if (!this.scene?.traverse) return 0;
		this.scene.updateWorldMatrix?.();
		let registrations = 0;
		this.scene.traverse((node) => {
			if (this.registeredNodes.has(node)) return;
			const candidate = createLodSceneCandidate(node, this.nextId(node));
			if (!candidate) return;
			if (!this.controller.register(candidate.registration)) return;
			this.registeredNodes.add(node);
			this.records.push(candidate.record);
			registrations += 1;
		});
		this.refreshes += 1;
		this.lastRefreshRegistrations = registrations;
		this.lastSceneRevision = this.scene._sceneGraphRevision ?? null;
		if (registrations > 0) this.controller.invalidate();
		return registrations;
	}

	update(context) {
		return this.controller.update(context);
	}

	diagnostics() {
		return sceneLodDiagnostics(this.records, this.controller, this);
	}

	destroy() {
		this.controller.restore();
		this.records.length = 0;
		this.registeredNodes = new WeakSet();
		this.lastRefreshRegistrations = 0;
	}

	nextId(node) {
		this.sequence += 1;
		const name = String(node?.name || 'mesh').replace(/[^a-z0-9_-]+/gi, '-');
		return `scene-lod-${this.sequence}-${name}`;
	}
}
