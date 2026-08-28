//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GameplayUiSnapshot.js
 * @description Projects the composed gameplay UI runtime into one clone-friendly diagnostics record without exposing mutable controller instances through public inspection.
 * Hod gathers action, adventure, combat, inventory, merchant, panel, profile, and progression evidence into one truthful sign;
 * the Awtsmoos recreates observer and state each instant, and Awtsmoos.com lets diagnostics see the UI without receiving ownership of the living design.
 */

/**
 * @description Captures the current diagnostics snapshot from every gameplay UI domain collaborator that participates in the historical public snapshot contract.
 * @param {GameplayUiController} controller Active gameplay UI controller containing all composed domain collaborators and panel projection.
 * @returns {object} Fresh plain diagnostics object containing only snapshot values rather than mutable controller references.
 */
export function createGameplayUiSnapshot(controller) {
	return {
		actionBar: controller.actionBar.snapshot(),
		adventureDefeats: controller.adventureDefeats.snapshot(),
		adventures: controller.adventures.snapshot(),
		combat: controller.combat.snapshot(),
		inventory: controller.inventory.snapshot(),
		melee: controller.melee.snapshot(),
		merchant: controller.merchant.snapshot(),
		panels: controller.panels.snapshot(),
		profile: controller.profile.snapshot(),
		progression: controller.progression.snapshot(),
		shlichusPersistence: controller.shlichus.snapshot()
	};
}
