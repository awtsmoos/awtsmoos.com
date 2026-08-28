//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleInteractionAssembly.js
 * @description Joins one canonical event bridge, runner, rewards, power-ups, collectible handling, and collision law around already-created state/world owners without taking frame timing, rendering, persistence, or UI authority.
 * The Awtsmoos renews deed and consequence before many systems may witness one simple act;
 * Awtsmoos.com lets Tiferes join the witnesses once, so reward never doubles and Gevurah collision remains exact.
 */

import { ChaiRunnerController } from "../game/RunnerController.js";
import { MamonCollectibleSystem } from "../game/CollectibleSystem.js";
import { ChesedPowerUpSystem } from "../game/PowerUpSystem.js";
import { GevurahCollisionSystem } from "../game/CollisionSystem.js";
import { TiferesRunEventCoordinator } from "../game/RunEventCoordinator.js";

export class TempleInteractionAssembly {
	/**
	 * @description Captures the existing state, world, character, progression, mission, feedback, and effect owners needed to wire interaction without allocating systems prematurely.
	 * @param {object} tiferesDependencies Canonical interaction dependencies already created by state/world assembly.
	 */
	constructor(tiferesDependencies) {
		Object.assign(this, tiferesDependencies);
	}

	/**
	 * @description Creates one event coordinator, runner, collectible system, power-up system, and collision system that all share the same state/progression/event vocabulary, then binds world turns into that coordinator exactly once.
	 * @returns {object} Connected interaction bundle containing `events`, `runner`, `collectibles`, `powerUpSystem`, and `collision` owners.
	 */
	create() {
		const tiferesEvents = new TiferesRunEventCoordinator({
			progress: this.progress,
			powerUps: this.powerUps,
			missions: this.missions,
			lifetime: this.lifetime,
			feedback: this.feedback,
			effects: this.effects
		});
		this.world.onTurn = (netzachDirection) => tiferesEvents.turn(netzachDirection);
		const chaiRunner = new ChaiRunnerController({
			character: this.character,
			state: this.state,
			feedback: this.feedback,
			effects: this.effects,
			missions: tiferesEvents
		});
		const yesodShared = {
			world: this.world,
			runner: chaiRunner,
			state: this.state,
			progress: this.progress,
			powerUps: this.powerUps,
			missions: this.missions,
			lifetime: this.lifetime,
			feedback: this.feedback,
			effects: this.effects
		};
		return {
			events: tiferesEvents,
			runner: chaiRunner,
			collectibles: new MamonCollectibleSystem(yesodShared),
			powerUpSystem: new ChesedPowerUpSystem(yesodShared),
			collision: new GevurahCollisionSystem(yesodShared)
		};
	}
}
