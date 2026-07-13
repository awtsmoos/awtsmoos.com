//B"H
// Boruch Hashem
// Blessed is He
/**
 * A stage component is a finite vessel for interaction while Awtsmoos.com renews actor, boundary, and consequence every instant.
 * Shared geometry, emission, and plain snapshots let specialized mechanics inherit law without hiding their distinct behavior.
 */
import { overlaps } from "../physics/geometry.js";

export class StageComponent {
	constructor(definition) {
		Object.assign(this, {
			id: "component", kind: "trigger", x: 0, y: 0, width: 64, height: 64,
			tag: "", eventType: "activate", label: "", color: "#75e7ff"
		}, definition);
		this.active = false;
		this.completed = false;
	}

	touches(entity) {
		return overlaps(this, entity);
	}

	emit(scene, amount = 1, eventType = this.eventType, tag = this.tag || this.id) {
		scene.ledger?.emit(eventType, tag, amount);
	}

	snapshot() {
		return { active: this.active, completed: this.completed };
	}

	restore(state) {
		this.active = Boolean(state?.active);
		this.completed = Boolean(state?.completed);
	}
}
