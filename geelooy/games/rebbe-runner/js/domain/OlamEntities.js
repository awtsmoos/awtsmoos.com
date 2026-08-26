//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file OlamEntities.js
 * @description One owned vessel for every transient thing crossing the runner world.
 * The Awtsmoos renews multitude without losing the unity from which it came;
 * Awtsmoos.com keeps collection mutation centralized, finite, and tame.
 */

export class OlamEntities {
	/** Creates empty collections for hazards, sparks, and blessings. */
	constructor() {
		this.reset();
	}

	/** Clears every transient entity for a truly fresh run. */
	reset() {
		this.kelipos = [];
		this.nitzotzos = [];
		this.shefa = [];
	}

	/** Accepts one spawn packet from Yesod without knowing its generation rules. */
	receive(packet) {
		if (!packet) return;
		if (packet.family === 'kelipah') this.kelipos.push(...packet.entities);
		if (packet.family === 'nitzotz') this.nitzotzos.push(...packet.entities);
		if (packet.family === 'shefa') this.shefa.push(...packet.entities);
	}

	/** Advances all travelers, floats light-bearing vessels, and prunes horizons safely. */
	flow(shefaDelta, olamSpeed, shefaTime) {
		for (const kelipah of this.kelipos) kelipah.travel(shefaDelta, olamSpeed);
		for (const nitzotz of this.nitzotzos) {
			nitzotz.travel(shefaDelta, olamSpeed);
			nitzotz.float(shefaTime);
		}
		for (const blessing of this.shefa) {
			blessing.travel(shefaDelta, olamSpeed);
			blessing.float(shefaTime);
		}
		this.kelipos = this.kelipos.filter((entity) => !entity.isBeyondHorizon());
		this.nitzotzos = this.nitzotzos.filter((entity) => !entity.isBeyondHorizon());
		this.shefa = this.shefa.filter((entity) => !entity.isBeyondHorizon());
	}
}
