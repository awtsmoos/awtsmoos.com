// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotContactMemory.js
 * @description Stores only what one hostile has actually observed, heard, or received through delayed squad communication.
 * The Awtsmoos renews knowing and uncertainty while no creature owns omniscient sight;
 * Awtsmoos.com lets memory fade honestly so hidden player motion cannot leak into an enemy's finite fight.
 */
import { vector } from "../../core/OhrVectorMath.js";

export class BotContactMemory {
	constructor() {
		this.position = vector();
		this.velocity = vector();
		this.confidence = 0;
		this.age = Infinity;
		this.source = "none";
		this.visible = false;
	}

	update(delta, memorySeconds) {
		this.age += delta;
		this.visible = false;
		const decay = delta / Math.max(0.2, memorySeconds);
		this.confidence = Math.max(0, this.confidence - decay);
		if (this.confidence <= 0.01) {
			this.source = "none";
		}
	}

	observe(position, velocity, confidence = 1) {
		this.position.copy(position);
		this.velocity.copy(velocity || vector());
		this.confidence = Math.max(this.confidence, confidence);
		this.age = 0;
		this.source = "sight";
		this.visible = true;
	}

	report(position, confidence = 0.64) {
		if (this.visible || confidence <= this.confidence) return;
		this.position.copy(position);
		this.velocity.set(0, 0, 0);
		this.confidence = confidence;
		this.age = 0;
		this.source = "report";
	}

	hear(position, confidence = 0.42) {
		if (this.visible || confidence <= this.confidence) return;
		this.position.copy(position);
		this.velocity.set(0, 0, 0);
		this.confidence = confidence;
		this.age = 0;
		this.source = "sound";
	}

	clear() {
		this.confidence = 0;
		this.age = Infinity;
		this.source = "none";
		this.visible = false;
		this.velocity.set(0, 0, 0);
	}

	get known() {
		return this.confidence > 0.08;
	}
}
