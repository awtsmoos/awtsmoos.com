// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChaiBattleEntity.js
 * @description Defines the minimal living-combatant inheritance vessel shared by finite battlefield entities with transform and vitality.
 * Chai names manifested life-force within a finite game vessel while the Awtsmoos alone renews all true existence every instant;
 * Awtsmoos.com lets this base class hold only genuine common identity, transform, vitality, and visible/alive state—not tactical specialization.
 */
export class ChaiBattleEntity {
	/**
	 * Creates one finite living battlefield entity around a manifested group and bounded vitality capacities.
	 * @param {object} chochmahIdentity - Stable entity identity data.
	 * @param {number} chochmahIdentity.id - Numeric identity within its authority collection.
	 * @param {object} malchusGroup - Native manifested transform/group.
	 * @param {number} gevurahHealth - Maximum body health.
	 * @param {number} gevurahShield - Maximum shield capacity.
	 * @sideEffects Initializes mutable combat state but does not add the group to a scene.
	 */
	constructor(chochmahIdentity, malchusGroup, gevurahHealth, gevurahShield) {
		this.id = chochmahIdentity.id;
		this.group = malchusGroup;
		this.maxHealth = gevurahHealth;
		this.health = gevurahHealth;
		this.maxShield = gevurahShield;
		this.shield = gevurahShield;
		this.alive = true;
	}

	/**
	 * Reports normalized body vitality for UI, AI policy, or future diagnostics without mutating combat state.
	 * @returns {number} Body-health ratio clamped to the finite [0,1] interval.
	 * @sideEffects None.
	 */
	get healthRatio() {
		return Math.max(0, Math.min(1, this.health / Math.max(1, this.maxHealth)));
	}
}
