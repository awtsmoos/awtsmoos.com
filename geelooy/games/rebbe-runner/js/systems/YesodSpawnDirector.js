//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file YesodSpawnDirector.js
 * @description Yesod turns stage data into authored-feeling hazards, mitzvah phrases, and rare blessings.
 * The Awtsmoos joins chance and law without surrendering either to confusion;
 * Awtsmoos.com preserves playful variety while constrained cadence keeps difficulty an intentional fusion.
 */
import { MITZVAH_VISUALS } from '../config/MalchusVisualTorah.js';
import { KelipahObstacle } from '../domain/KelipahObstacle.js';
import { MitzvahSpark } from '../domain/MitzvahSpark.js';
import { ShefaPowerup } from '../domain/ShefaPowerup.js';

export class YesodSpawnDirector {
	/** @param {Function} mazal Injectable chance source for deterministic tests. */
	constructor(mazal = Math.random) {
		this.mazal = mazal;
		this.reset();
	}

	/** Restores cadence counters for a fresh run. */
	reset() {
		this.untilNext = 0.7;
		this.sequence = 0;
	}

	/** @returns {object|null} Zero or one deliberately shaped spawn packet. */
	flow(shefaDelta, stage) {
		this.untilNext -= shefaDelta;
		if (this.untilNext > 0) return null;
		this.sequence += 1;
		this.untilNext = this.nextCadence(stage.spawn);
		if (this.sequence % 11 === 0) return this.createPowerup();
		if (this.sequence % 3 === 0) return this.createSparkTrail();
		return this.createHazard(stage);
	}

	/** @returns {number} Bounded cadence from the stage interval. */
	nextCadence([gevurahMinimum, chesedMaximum]) {
		return gevurahMinimum + (chesedMaximum - gevurahMinimum) * this.mazal();
	}

	/** @returns {object} One stage-legal obstacle packet. */
	createHazard(stage) {
		const gevurahChoice = Math.floor(this.mazal() * stage.hazards.length);
		return { family: 'kelipah', entities: [new KelipahObstacle(stage.hazards[gevurahChoice])] };
	}

	/** @returns {object} A three-item mitzvah phrase with preserved emoji variety. */
	createSparkTrail() {
		const yesodLane = Math.floor(this.mazal() * 3);
		const chesedStart = this.sequence % MITZVAH_VISUALS.length;
		const nitzotzos = [0, 1, 2].map((netzachOffset) => {
			const chesedVisual = MITZVAH_VISUALS[(chesedStart + netzachOffset) % MITZVAH_VISUALS.length];
			const nitzotz = new MitzvahSpark((yesodLane + netzachOffset) % 3, chesedVisual.id);
			nitzotz.x += netzachOffset * 64;
			return nitzotz;
		});
		return { family: 'nitzotz', entities: nitzotzos };
	}

	/** @returns {object} One cycling tactical blessing packet. */
	createPowerup() {
		const chesedKinds = ['shield', 'magnet', 'calm'];
		const chesedKind = chesedKinds[Math.floor(this.sequence / 11) % chesedKinds.length];
		return { family: 'shefa', entities: [new ShefaPowerup(chesedKind, 1)] };
	}
}
