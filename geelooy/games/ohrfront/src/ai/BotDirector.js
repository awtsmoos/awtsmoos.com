// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotDirector.js
 * @description Preserves Ohrfront's simple hostile-squad API while governing specialized manifestation, cognition, procession, damage, communication, and reserve vessels.
 * Keser governs without cheating or micromanaging: the Awtsmoos remains beyond every finite director, contact, projectile, and decision;
 * Awtsmoos.com lets this facade become genuinely small so infinite future expansion enters through explicit classes instead of another central monolith.
 */
import { GevurahBotDamageAuthority } from "./runtime/GevurahBotDamageAuthority.js";
import { MalchusBotSquadManifestor } from "./runtime/MalchusBotSquadManifestor.js";
import { NetzachBotReinforcementStage } from "./runtime/NetzachBotReinforcementStage.js";
import { TiferesBotCognitionStage } from "./runtime/TiferesBotCognitionStage.js";
import { TiferesBotFireStage } from "./runtime/TiferesBotFireStage.js";
import { TiferesBotProcession } from "./runtime/TiferesBotProcession.js";
import { BotReinforcementBudget } from "./squad/BotReinforcementBudget.js";
import { SquadBlackboard } from "./squad/SquadBlackboard.js";
import { SquadRolePlanner } from "./squad/SquadRolePlanner.js";

export class BotDirector {
	/**
	 * Creates the public hostile authority and composes every specialized squad vessel before manifesting the deterministic opening force.
	 * @param {object} malchusScene - Native scene receiving hostile manifestation.
	 * @param {object} gevurahCollisionWorld - Static collision and occlusion authority.
	 * @param {object} netzachProjectiles - Projectile facade.
	 * @param {object} malchusPlayer - Player authority observed only through cognition perception.
	 * @param {object} chochmahDifficulty - Immutable cognition-focused difficulty profile.
	 * @param {Array<object>} chochmahCoverPoints - Tactical cover catalog.
	 * @param {object} malchusMaterialLibrary - Progressive remote-material authority.
	 * @sideEffects Manifests the opening squad through Malchus after all focused stage authorities are assembled.
	 */
	constructor(malchusScene, gevurahCollisionWorld, netzachProjectiles, malchusPlayer, chochmahDifficulty, chochmahCoverPoints, malchusMaterialLibrary) {
		this.kills = 0;
		this.yesodBlackboard = new SquadBlackboard(chochmahDifficulty, chochmahCoverPoints);
		this.netzachReinforcementBudget = new BotReinforcementBudget(chochmahDifficulty.reinforcements || 0);
		const tiferesCognitionStage = new TiferesBotCognitionStage({
			player: malchusPlayer,
			difficulty: chochmahDifficulty,
			blackboard: this.yesodBlackboard,
			rolePlanner: new SquadRolePlanner()
		});
		const tiferesFireStage = new TiferesBotFireStage({ difficulty: chochmahDifficulty, projectiles: netzachProjectiles });
		const netzachReinforcementStage = new NetzachBotReinforcementStage({ budget: this.netzachReinforcementBudget, blackboard: this.yesodBlackboard });
		this.tiferesProcession = new TiferesBotProcession({
			blackboard: this.yesodBlackboard,
			cognitionStage: tiferesCognitionStage,
			fireStage: tiferesFireStage,
			reinforcementStage: netzachReinforcementStage,
			difficulty: chochmahDifficulty,
			collisionWorld: gevurahCollisionWorld
		});
		this.gevurahDamageAuthority = new GevurahBotDamageAuthority(this.yesodBlackboard, () => { this.kills += 1; });
		const malchusManifestor = new MalchusBotSquadManifestor({
			scene: malchusScene,
			collisionWorld: gevurahCollisionWorld,
			difficulty: chochmahDifficulty,
			coverPoints: chochmahCoverPoints,
			materialLibrary: malchusMaterialLibrary,
			blackboard: this.yesodBlackboard
		});
		this.bots = malchusManifestor.manifest(chochmahDifficulty.botCount);
	}

	/** Advances the authoritative hostile-squad procession by one fixed simulation step. */
	update(netzachDelta) {
		this.tiferesProcession.advance(this.bots, netzachDelta);
	}

	/** Resolves one player projectile segment through the focused hostile damage authority. */
	hitSegment(chochmahStartPoint, chochmahEndPoint, gevurahDamage) {
		return this.gevurahDamageAuthority.resolve(this.bots, chochmahStartPoint, chochmahEndPoint, gevurahDamage);
	}

	/** Gives nearby living hostiles uncertain auditory evidence of one player weapon discharge. */
	hearShot(chochmahSoundPosition) {
		return this.yesodBlackboard.hearShot(this.bots, chochmahSoundPosition);
	}

	/** @returns {number} Number of currently living hostiles, excluding defeated reserve candidates. */
	get livingCount() {
		return this.bots.filter(tiferesBot => tiferesBot.alive).length;
	}

	/** @returns {number} Number of finite reinforcements still authorized by encounter difficulty data. */
	get reinforcementsRemaining() {
		return this.netzachReinforcementBudget.remaining;
	}
}
