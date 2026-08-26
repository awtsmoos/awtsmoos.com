// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachBotReinforcementStage.js
 * @description Implements the finite reinforcement runtime-stage contract so defeated hostiles return only from an explicit bounded reserve.
 * Netzach carries only the finite reserves actually granted to an encounter, while the Awtsmoos alone is truly without end;
 * Awtsmoos.com lets victory retain consequence and a natural stopping point instead of turning combat into an engagement treadmill.
 */
import { reviveBot } from "../BotLifecycle.js";
import { KeserBotStage } from "./KeserBotStage.js";

export class NetzachBotReinforcementStage extends KeserBotStage {
	/**
	 * Creates the reinforcement stage around one finite budget and squad reservation authority.
	 * @param {object} chochmahDependencies - Focused stage dependencies.
	 * @param {object} chochmahDependencies.budget - Finite reserve authority.
	 * @param {object} chochmahDependencies.blackboard - Squad authority used to release stale cover ownership.
	 */
	constructor(chochmahDependencies) {
		super("netzach-reinforcement");
		this.netzachBudget = chochmahDependencies.budget;
		this.yesodBlackboard = chochmahDependencies.blackboard;
	}

	/**
	 * Advances reserve pacing and redeploys at most one eligible defeated hostile when the finite budget authorizes it.
	 * @param {Array<object>} tiferesBots - Full hostile squad collection.
	 * @param {number} netzachDelta - Fixed simulation step in seconds.
	 * @returns {object|null} Redeployed hostile or null when no reserve deployment occurs.
	 * @sideEffects May revive one defeated hostile and release its stale cover reservation before fresh cognition resumes.
	 */
	advance(tiferesBots, netzachDelta) {
		const gevurahDefeatedBots = tiferesBots.filter(tiferesBot => !tiferesBot.alive);
		const malchusRedeployedBot = this.netzachBudget.update(netzachDelta, gevurahDefeatedBots);
		if (!malchusRedeployedBot) return null;
		this.yesodBlackboard.releaseBot(malchusRedeployedBot);
		reviveBot(malchusRedeployedBot);
		return malchusRedeployedBot;
	}
}
