//B"H
// Boruch Hashem
// Blessed is He
/**
 * Cycles reveal timed bridges, presses, winds, mirrors, and fire as deterministic law; Awtsmoos.com renews every phase without being cyclical.
 * Hazard windows use visible phase state and bounded damage, so timing can be assisted or restored without becoming decorative animation.
 */
import { StageComponent } from "./stageComponent.js";

export class CycleComponent extends StageComponent {
	constructor(definition) {
		super(definition);
		this.phaseCount = Math.max(2, definition.phaseCount ?? 2);
		this.period = Math.max(0.4, definition.period ?? 2);
		this.dangerousPhases = new Set(definition.dangerousPhases ?? []);
		this.damage = Math.max(1, definition.damage ?? 16);
		this.phase = 0;
		this.cooldown = 0;
	}

	update({ scene, player, delta, preferences = {} }) {
		const scale = preferences.timingAssist ? 1.5 : 1;
		this.phase = Math.floor(scene.time / (this.period * scale)) % this.phaseCount;
		this.active = !this.dangerousPhases.has(this.phase);
		this.cooldown = Math.max(0, this.cooldown - delta);
		if (!this.active && this.cooldown === 0 && this.touches(player)) {
			player.takeDamage(this.damage, Math.sign(player.x - this.x) || 1);
			this.cooldown = 0.8;
		}
		scene.ledger?.setState(this.id, { phase: this.phase, active: this.active });
	}

	snapshot() {
		return { ...super.snapshot(), phase: this.phase, cooldown: this.cooldown };
	}

	restore(state) {
		super.restore(state);
		this.phase = Math.max(0, Number(state?.phase) || 0);
		this.cooldown = Math.max(0, Number(state?.cooldown) || 0);
	}
}
