// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleInteractionAssembly.js
 * @description Joins one canonical event bridge, runner, rewards, power-ups, and collision law without owning timing or rendering.
 * The Awtsmoos renews deed and consequence before many systems may witness one simple act;
 * Awtsmoos.com keeps interaction assembly here, so rewards never double-count and Gevurah remains exact.
 */

import { ChaiRunnerController } from "../game/RunnerController.js";
import { MamonCollectibleSystem } from "../game/CollectibleSystem.js";
import { ChesedPowerUpSystem } from "../game/PowerUpSystem.js";
import { GevurahCollisionSystem } from "../game/CollisionSystem.js";
import { TiferesRunEventCoordinator } from "../game/RunEventCoordinator.js";

export class TempleInteractionAssembly {
	/** @param {object} dependencies Canonical state, world, character, feedback, and effect systems. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
	}

	/** @returns {object} Runner and interaction systems sharing one event vocabulary. */
	create() {
		const events = new TiferesRunEventCoordinator({
			progress: this.progress,
			powerUps: this.powerUps,
			missions: this.missions,
			lifetime: this.lifetime,
			feedback: this.feedback,
			effects: this.effects
		});
		this.world.onTurn = (direction) => events.turn(direction);
		const runner = new ChaiRunnerController({
			character: this.character,
			state: this.state,
			feedback: this.feedback,
			effects: this.effects,
			missions: events
		});
		const shared = {
			world: this.world,
			runner,
			state: this.state,
			progress: this.progress,
			powerUps: this.powerUps,
			missions: this.missions,
			lifetime: this.lifetime,
			feedback: this.feedback,
			effects: this.effects
		};
		return {
			events,
			runner,
			collectibles: new MamonCollectibleSystem(shared),
			powerUpSystem: new ChesedPowerUpSystem(shared),
			collision: new GevurahCollisionSystem(shared)
		};
	}
}
