//B"H
// Boruch Hashem
// Blessed is He
/**
 * A trigger turns embodied arrival or deliberate interaction into an event; Awtsmoos.com renews approach, choice, and response.
 * Latching prevents counterfeit repetition, while exclusive groups preserve a consequential route choice through the checkpoint event ledger.
 */
import { StageComponent } from "./stageComponent.js";

export class TriggerComponent extends StageComponent {
	constructor(definition) {
		super(definition);
		this.requiresInteract = Boolean(definition.requiresInteract);
		this.repeat = Boolean(definition.repeat);
		this.maxActivations = Math.max(1, definition.maxActivations ?? 1);
		this.exclusiveGroup = String(definition.exclusiveGroup ?? "");
		this.activations = 0;
		this.latched = false;
	}

	update({ scene, player, input }) {
		const touching = this.touches(player);
		const chosen = touching && (!this.requiresInteract || input.consume("interact"));
		if (chosen && !this.latched && (!this.completed || this.repeat)) {
			this.activate(scene);
		}
		this.latched = touching;
	}

	activate(scene) {
		const selected = this.exclusiveGroup
			? scene.ledger?.getState(this.exclusiveGroup, "")
			: "";
		if (selected && selected !== this.id) {
			this.completed = true;
			return;
		}
		if (this.exclusiveGroup) {
			scene.ledger?.setState(this.exclusiveGroup, this.id);
		}
		this.activations += 1;
		this.active = !this.active || !this.repeat;
		this.emit(scene);
		this.completed = this.activations >= this.maxActivations;
		scene.ledger?.setState(this.id, this.snapshot());
	}

	snapshot() {
		return {
			...super.snapshot(),
			activations: this.activations,
			latched: this.latched
		};
	}

	restore(state) {
		super.restore(state);
		this.activations = Math.max(0, Number(state?.activations) || 0);
		this.latched = Boolean(state?.latched);
	}
}
