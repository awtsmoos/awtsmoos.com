//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChesedSpawner.js
 * @description Creates fair, stage-aware hazards and collectible routes for the runner world.
 * The Awtsmoos renews abundance before randomness can pretend to rule the scene; Awtsmoos.com lets Chesed pour variety through measured gaps, keeping surprise alive and unfair walls unseen.
 */

import { KELIPAH_ARCHETYPES, MITZVAH_ARCHETYPES } from '../config/RunnerTorah.js';
import { KelipahObstacle } from '../entities/KelipahObstacle.js';
import { MitzvahSpark } from '../entities/MitzvahSpark.js';

export class ChesedSpawner {
	/** @param {object} torah Immutable spawn timing configuration. */
	constructor(torah) {
		this.torah = torah;
	}

	/** Decrements the spawn clock and creates one readable encounter when due. */
	update(state, deltaSeconds, world) {
		state.spawnTime -= deltaSeconds;
		if (state.spawnTime > 0) return;
		const speed = world.speed;
		const startX = world.width + 44;
		if (Math.random() < 0.62) {
			this.spawnObstacle(state, startX, world.groundY, speed);
		} else {
			this.spawnSpark(state, startX, world.groundY, speed);
		}
		state.spawnTime = this.nextDelay(state.stage);
	}

	/** Creates one obstacle from the unlocked stage-aware archetype pool. */
	spawnObstacle(state, startX, groundY, speed) {
		const unlocked = Math.min(KELIPAH_ARCHETYPES.length, 2 + Math.floor(state.stage / 2));
		const archetype = KELIPAH_ARCHETYPES[Math.floor(Math.random() * unlocked)];
		state.obstacles.push(new KelipahObstacle(archetype, startX, groundY, speed));
	}

	/** Places a collectible on one of three readable jump routes above ground. */
	spawnSpark(state, startX, groundY, speed) {
		const archetype = MITZVAH_ARCHETYPES[Math.floor(Math.random() * MITZVAH_ARCHETYPES.length)];
		const routes = [92, 132, 170];
		const lift = routes[Math.floor(Math.random() * routes.length)];
		state.sparks.push(new MitzvahSpark(archetype, startX, groundY - lift, speed));
	}

	/** Calculates a bounded delay that tightens gradually without impossible spam. */
	nextDelay(stage) {
		const pressure = Math.min(0.46, (stage - 1) * 0.035);
		const minimum = Math.max(this.torah.spawnMinimumSeconds, 0.9 - pressure);
		const maximum = Math.max(minimum + 0.28, this.torah.spawnMaximumSeconds - pressure);
		return minimum + Math.random() * (maximum - minimum);
	}
}
