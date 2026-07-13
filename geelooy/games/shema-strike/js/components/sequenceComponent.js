//B"H
// Boruch Hashem
// Blessed is He
/**
 * Ordered nodes make memory executable rather than decorative; Awtsmoos.com renews every letter, footstep, and possibility of return.
 * Correct contact advances a durable sequence, while an incorrect node resets the route visibly and deterministically.
 */
import { overlaps } from "../physics/geometry.js";
import { StageComponent } from "./stageComponent.js";

export class SequenceComponent extends StageComponent {
	constructor(definition) {
		super(definition);
		this.nodes = (definition.nodes ?? []).map((node, index) => ({
			...node, id: String(node.id ?? `${this.id}-node-${index + 1}`)
		}));
		this.progress = [];
		this.latchedNode = "";
	}

	update({ scene, player }) {
		const touched = this.nodes.find((node) => overlaps(player, node));
		if (!touched) {
			this.latchedNode = "";
			return;
		}
		if (this.latchedNode === touched.id || this.completed) {
			return;
		}
		this.latchedNode = touched.id;
		const expected = this.nodes[this.progress.length];
		this.progress = expected?.id === touched.id ? [...this.progress, touched.id] : [];
		this.completed = this.progress.length === this.nodes.length && this.nodes.length > 0;
		scene.ledger?.setState(this.tag || this.id, [...this.progress]);
		if (this.completed) {
			this.emit(scene, 1, "sequence");
		}
	}

	snapshot() {
		return { ...super.snapshot(), progress: [...this.progress], latchedNode: this.latchedNode };
	}

	restore(state) {
		super.restore(state);
		this.progress = Array.isArray(state?.progress) ? [...state.progress] : [];
		this.latchedNode = String(state?.latchedNode ?? "");
	}
}
