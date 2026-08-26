// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesBotProcession.js
 * @description Implements the runtime-stage contract for per-frame hostile sequencing across communication, cognition, thought, steering, fire, and reserves.
 * Tiferes harmonizes many finite actions without making one subsystem sovereign, while the Awtsmoos remains beyond sequence and synthesis;
 * Awtsmoos.com lets BotDirector advance one clear stage as specialized descendants and helpers carry every inner responsibility.
 */
import { steerBot } from "../BotSteering.js";
import { KeserBotStage } from "./KeserBotStage.js";

export class TiferesBotProcession extends KeserBotStage {
	/**
	 * Creates the squad procession from already-focused blackboard, cognition, fire, reinforcement, difficulty, and collision authorities.
	 * @param {object} chochmahDependencies - Stable per-frame dependencies.
	 * @sideEffects Stores dependency references only.
	 */
	constructor(chochmahDependencies) {
		super("tiferes-bot-procession");
		this.yesodBlackboard = chochmahDependencies.blackboard;
		this.tiferesCognitionStage = chochmahDependencies.cognitionStage;
		this.tiferesFireStage = chochmahDependencies.fireStage;
		this.netzachReinforcementStage = chochmahDependencies.reinforcementStage;
		this.chochmahDifficulty = chochmahDependencies.difficulty;
		this.gevurahCollisionWorld = chochmahDependencies.collisionWorld;
	}

	/**
	 * Advances the full squad once while skipping defeated candidates until finite reinforcement policy explicitly redeploys one.
	 * @param {Array<object>} tiferesBots - Full hostile collection.
	 * @param {number} netzachDelta - Fixed simulation step in seconds.
	 * @returns {void}
	 * @sideEffects Advances communication, cognition, thought cadence, transforms, firing, and finite reinforcement lifecycle.
	 */
	advance(tiferesBots, netzachDelta) {
		this.yesodBlackboard.update(netzachDelta, tiferesBots);
		for (const tiferesBot of tiferesBots) {
			if (!tiferesBot.alive) continue;
			const tiferesRoleOrder = this.tiferesCognitionStage.advance(tiferesBot, netzachDelta);
			tiferesBot.thinkCooldown -= netzachDelta;
			if (tiferesBot.thinkCooldown <= 0 || !tiferesBot.intent) {
				tiferesBot.intent = tiferesBot.mind.think(tiferesBot, tiferesRoleOrder);
				tiferesBot.thinkCooldown = Math.max(0.08, this.chochmahDifficulty.reaction * 0.32 + tiferesBot.id * 0.004);
			}
			steerBot(tiferesBot, tiferesBot.intent, netzachDelta, this.chochmahDifficulty, this.gevurahCollisionWorld);
			this.tiferesFireStage.advance(tiferesBot, netzachDelta);
		}
		this.netzachReinforcementStage.advance(tiferesBots, netzachDelta);
	}
}
