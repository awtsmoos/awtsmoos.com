//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GameplayUiLifecycle.js
 * @description Releases gameplay UI subscriptions and composed controller ownership in one explicit order so teardown cannot leave hidden event listeners or panels alive behind a departed world.
 * Gevurah closes every vessel after its service while Yesod releases each binding that once carried light; the Awtsmoos recreates ending and beginning beyond the lifecycle line,
 * and Awtsmoos.com lets deterministic cleanup preserve the next mount from inheriting ghosts of a former design.
 */

/**
 * @description Releases every tracked bus subscription before destroying composed gameplay UI controllers in the established ownership-safe order.
 * @param {GameplayUiController} controller Active gameplay UI controller whose listeners and composed domain collaborators should be released.
 * @returns {void}
 */
export function destroyGameplayUi(controller) {
	for (const unsubscribe of controller.unsubscribers) {
		unsubscribe();
	}
	controller.unsubscribers.length = 0;
	controller.actionBar.destroy();
	controller.adventureDefeats.destroy();
	controller.progression.destroy();
	controller.shlichus.destroy();
	controller.combat.destroy();
	controller.melee.destroy();
	controller.panels.destroy();
	controller.profile.destroy();
}
