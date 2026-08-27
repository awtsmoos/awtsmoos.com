// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExpansionLandmarkActor.js
 * @description Makes region landmarks studyable, distance-bound, and canonically actionable.
 * The Awtsmoos gives each finite marker one truthful purpose; Awtsmoos.com lets first sight
 * reveal it and second sight dispatch travel, mission, activity, or encounter without forgery.
 */
import { npcPointerHits } from '../world/npc/NpcPointerRay.js';

export class ExpansionLandmarkActor {
	constructor(runtime, mesh, action) {
		this.runtime = runtime;
		this.mesh = mesh;
		this.action = action;
		this.selected = false;
	}

	hitPointer(event) {
		if (!this.visible()) return false;
		return npcPointerHits(
			event,
			this.runtime.camera,
			this.runtime.renderer?.domElement,
			this.targetHint(),
			2.4
		);
	}

	target() {
		if (!this.visible()) return false;
		this.selected = true;
		this.runtime.bus.emit('target:studied', {
			action: this.action,
			name: this.mesh.name,
			position: this.targetHint()
		});
		return true;
	}

	clear() {
		this.selected = false;
	}

	async interact() {
		if (!this.visible()) return false;
		const position = this.targetHint();
		const distance = Math.hypot(
			position.x - this.runtime.state.x,
			position.z - this.runtime.state.z
		);
		if (distance > 8) {
			this.runtime.bus.emit('world:interaction-rejected', {
				action: this.action,
				reason: 'TOO_FAR'
			});
			return false;
		}
		return dispatch(this.runtime, this.action);
	}

	targetHint() {
		return worldPosition(this.mesh);
	}

	visible() {
		let node = this.mesh;
		while (node) {
			if (node.visible === false) return false;
			node = node.parent;
		}
		return true;
	}
}

async function dispatch(runtime, action) {
	const [kind, id] = String(action || '').split(':');
	if (kind === 'region') return runtime.expansion.transition(id);
	if (kind === 'activity') return runtime.expansion.activity(id);
	if (kind === 'mission') {
		runtime.catalogAdventures?.offer?.(id);
		runtime.bus.emit('quest:offer', { questId: id });
		return true;
	}
	if (kind === 'encounter') {
		runtime.bus.emit('elite:encounter-request', { eliteId: id });
		return true;
	}
	return false;
}

function worldPosition(mesh) {
	const result = { x: 0, y: 0, z: 0 };
	let node = mesh;
	while (node) {
		result.x += Number(node.position?.x) || 0;
		result.y += Number(node.position?.y) || 0;
		result.z += Number(node.position?.z) || 0;
		node = node.parent;
	}
	return result;
}
