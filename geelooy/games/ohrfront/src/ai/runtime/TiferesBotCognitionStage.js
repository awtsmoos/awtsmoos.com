// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesBotCognitionStage.js
 * @description Coordinates memory, suppression, legitimate perception, delayed squad sharing, and squad-aware role orders while preserving the historical hostile cognition-stage API.
 * Tiferes joins partial sight with shared cadence while the Awtsmoos renews memory, concealment, pressure, and every finite decision;
 * Awtsmoos.com lets one bot receive coordinated purpose without ever inheriting an omniscient view of what its own senses did not reveal.
 */
import { KeserBotStage } from "./KeserBotStage.js";

export class TiferesBotCognitionStage extends KeserBotStage {
	/**
	 * Creates cognition around the legitimate player-perception boundary, difficulty memory law, squad blackboard, and role planner.
	 * @param {object} chochmahDependencies - Focused stage dependencies.
	 * @param {object} chochmahDependencies.player - Player authority visible only through BotPerception.
	 * @param {object} chochmahDependencies.difficulty - Cognition-first difficulty profile.
	 * @param {object} chochmahDependencies.blackboard - Communication/pressure/cover squad authority.
	 * @param {object} chochmahDependencies.rolePlanner - Evidence- and squad-context role-order authority.
	 */
	constructor(chochmahDependencies) {
		super("tiferes-cognition");
		this.malchusPlayer = chochmahDependencies.player;
		this.chochmahDifficulty = chochmahDependencies.difficulty;
		this.yesodBlackboard = chochmahDependencies.blackboard;
		this.tiferesRolePlanner = chochmahDependencies.rolePlanner;
	}

	/**
	 * Advances one hostile's evidence state and returns a squad-aware high-level order for tactical thought.
	 * @param {object} tiferesBot - Alive hostile carrying installed contact/perception/suppression vessels.
	 * @param {number} netzachDelta - Fixed simulation step in seconds.
	 * @returns {object} Plain immutable-style role order consumed by BotTacticalMind.
	 * @sideEffects Decays memory/suppression, performs legitimate perception, may queue a delayed sight report, and reads current squad rhythm context.
	 * @invariant No hidden player coordinate leaves this stage except through a successful BotPerception observation written into contact memory.
	 */
	advance(tiferesBot, netzachDelta) {
		tiferesBot.contact.update(netzachDelta, this.chochmahDifficulty.memory);
		tiferesBot.suppression.update(netzachDelta);
		tiferesBot.perception.observe(tiferesBot, this.malchusPlayer, netzachDelta);
		this.yesodBlackboard.shareSight(tiferesBot);
		const hodSquadContext = this.yesodBlackboard.tacticalContextFor(tiferesBot);
		return this.tiferesRolePlanner.order(tiferesBot, hodSquadContext);
	}
}

/**
 * Preserves the earlier functional entry point while delegating through the class-based cognition stage.
 * @returns {object} Squad-aware role order returned by a temporary stage instance.
 */
export function advanceTiferesBotCognition(
	tiferesBot,
	malchusPlayer,
	netzachDelta,
	chochmahDifficulty,
	yesodBlackboard,
	tiferesRolePlanner
) {
	return new TiferesBotCognitionStage({
		player: malchusPlayer,
		difficulty: chochmahDifficulty,
		blackboard: yesodBlackboard,
		rolePlanner: tiferesRolePlanner
	}).advance(tiferesBot, netzachDelta);
}
