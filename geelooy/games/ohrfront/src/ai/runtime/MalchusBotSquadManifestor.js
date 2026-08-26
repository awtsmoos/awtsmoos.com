// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusBotSquadManifestor.js
 * @description Manifests the deterministic opening hostile squad and equips each body with cognition plus evidence-based tactical policy.
 * Malchus reveals finite combatants into the scene while the Awtsmoos remains beyond body, role, mind, and number;
 * Awtsmoos.com lets manifestation become one reusable class so BotDirector governs a squad without knowing geometry/material construction details.
 */
import { getBotRole } from "../BotRoles.js";
import { BotTacticalMind } from "../BotTacticalMind.js";
import { createBotCombatant } from "../BotCombatantFactory.js";
import { installChochmahBotCognition } from "./ChochmahBotCognitionState.js";

export class MalchusBotSquadManifestor {
	/**
	 * Creates the squad manifestation authority around scene, cognition, tactical-cover, and material dependencies.
	 * @param {object} chochmahDependencies - Stable dependencies used for every opening hostile.
	 * @sideEffects Stores references only; no hostile is manifested before `manifest` is called.
	 */
	constructor(chochmahDependencies) {
		this.malchusScene = chochmahDependencies.scene;
		this.gevurahCollisionWorld = chochmahDependencies.collisionWorld;
		this.chochmahDifficulty = chochmahDependencies.difficulty;
		this.chochmahCoverPoints = chochmahDependencies.coverPoints;
		this.malchusMaterialLibrary = chochmahDependencies.materialLibrary;
		this.yesodBlackboard = chochmahDependencies.blackboard;
	}

	/**
	 * Manifests a deterministic circular opening squad and equips every Medaber hostile with cognition and tactical mind.
	 * @param {number} gevurahCount - Number of opening hostiles requested by difficulty data.
	 * @returns {Array<object>} Fully equipped hostile collection in stable identity order.
	 * @sideEffects Adds native hostile groups to the scene and installs cognition/mind objects on each returned entity.
	 */
	manifest(gevurahCount) {
		const malchusBots = [];
		for (let chochmahIndex = 0; chochmahIndex < gevurahCount; chochmahIndex += 1) {
			const tiferesAngle = chochmahIndex / Math.max(1, gevurahCount) * Math.PI * 2;
			const gevurahRadius = 58 + chochmahIndex % 3 * 23;
			const chochmahRole = getBotRole(chochmahIndex);
			const malchusBot = createBotCombatant(
				this.malchusScene,
				chochmahIndex,
				chochmahRole,
				Math.cos(tiferesAngle) * gevurahRadius,
				Math.sin(tiferesAngle) * gevurahRadius,
				this.malchusMaterialLibrary
			);
			installChochmahBotCognition(malchusBot, this.chochmahDifficulty, this.gevurahCollisionWorld);
			malchusBot.mind = new BotTacticalMind(chochmahRole, this.chochmahCoverPoints, this.gevurahCollisionWorld, this.yesodBlackboard);
			malchusBots.push(malchusBot);
		}
		return malchusBots;
	}
}
