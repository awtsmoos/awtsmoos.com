// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MedaberHostileCombatant.js
 * @description Extends finite Chai vitality with the role, intention, patrol, cadence, and cognition hooks required by an intelligent hostile.
 * Medaber signifies articulated intention within the simulated world while the Awtsmoos transcends every created category and name;
 * Awtsmoos.com lets this descendant add only what an intelligent hostile truly is, preserving a clean base for future living entities and factions.
 */
import { vector } from "../../core/OhrVectorMath.js";
import { ChaiBattleEntity } from "./ChaiBattleEntity.js";

export class MedaberHostileCombatant extends ChaiBattleEntity {
	/**
	 * Creates deterministic hostile domain state around an already manifested native group.
	 * @param {object} chochmahIdentity - Stable hostile identity containing `id` and immutable tactical `role`.
	 * @param {object} malchusGroup - Native scene group representing the hostile body.
	 * @sideEffects Initializes deterministic cadence/patrol/redeployment fields; cognition vessels are installed separately.
	 */
	constructor(chochmahIdentity, malchusGroup) {
		super(chochmahIdentity, malchusGroup, chochmahIdentity.role.health, chochmahIdentity.role.shield);
		this.role = chochmahIdentity.role;
		this.yaw = 0;
		this.cooldown = 0.28 + (this.id % 5) * 0.11;
		this.thinkCooldown = (this.id % 4) * 0.035;
		this.strafe = this.id % 2 ? 1 : -1;
		this.redeployments = 0;
		this.memoryTime = 0;
		this.lastSeen = vector();
		this.patrolTarget = vector((this.id % 3 - 1) * 45, 0, -20 - this.id * 8);
		this.intent = null;
	}
}
