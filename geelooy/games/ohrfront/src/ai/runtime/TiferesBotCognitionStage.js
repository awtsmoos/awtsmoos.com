// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesBotCognitionStage.js
 * @description Implements the hostile cognition runtime-stage contract by coordinating memory, suppression, perception, squad sharing, and role orders.
 * Tiferes joins many partial truths without granting omniscience, while the Awtsmoos remains beyond all knowing and concealment;
 * Awtsmoos.com lets every descendant stage reveal one bounded responsibility through the same Keser runtime covenant.
 */
import { KeserBotStage } from "./KeserBotStage.js";

export class TiferesBotCognitionStage extends KeserBotStage {
	/**
	 * Creates the cognition stage around legitimate perception, difficulty memory law, delayed squad communication, and role planning.
	 * @param {object} chochmahDependencies - Focused stage dependencies.
	 * @param {object} chochmahDependencies.player - Player authority visible only through BotPerception.
	 * @param {object} chochmahDependencies.difficulty - Cognition-focused difficulty profile.
	 * @param {object} chochmahDependencies.blackboard - Delayed squad communication authority.
	 * @param {object} chochmahDependencies.rolePlanner - Stable role-order authority.
	 */
	constructor(chochmahDependencies) {
		super("tiferes-cognition");
		this.malchusPlayer = chochmahDependencies.player;
		this.chochmahDifficulty = chochmahDependencies.difficulty;
		this.yesodBlackboard = chochmahDependencies.blackboard;
		this.tiferesRolePlanner = chochmahDependencies.rolePlanner;
	}

	/**
	 * Advances one hostile's evidence state and returns a high-level role order for tactical thought.
	 * @param {object} tiferesBot - Alive hostile carrying installed contact/perception/suppression vessels.
	 * @param {number} netzachDelta - Fixed simulation step in seconds.
	 * @returns {object} Role-derived tactical order consumed by BotTacticalMind.
	 * @sideEffects Decays memory/suppression, performs legitimate perception, and may queue delayed squad sight reports.
	 * @invariant No hidden player coordinate leaves this stage except through a successful perception observation.
	 */
	advance(tiferesBot, netzachDelta) {
		tiferesBot.contact.update(netzachDelta, this.chochmahDifficulty.memory);
		tiferesBot.suppression.update(netzachDelta);
		tiferesBot.perception.observe(tiferesBot, this.malchusPlayer, netzachDelta);
		this.yesodBlackboard.shareSight(tiferesBot);
		return this.tiferesRolePlanner.order(tiferesBot);
	}
}

/**
 * Preserves the earlier functional entry point for tests/integrators while delegating to the class-based stage implementation.
 * @returns {object} Role order returned by a temporary stage instance.
 */
export function advanceTiferesBotCognition(tiferesBot, malchusPlayer, netzachDelta, chochmahDifficulty, yesodBlackboard, tiferesRolePlanner) {
	return new TiferesBotCognitionStage({
		player: malchusPlayer,
		difficulty: chochmahDifficulty,
		blackboard: yesodBlackboard,
		rolePlanner: tiferesRolePlanner
	}).advance(tiferesBot, netzachDelta);
}
