//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GameplayUiEventBindings.js
 * @description Binds semantic gameplay bus events to their domain controllers and panel projections without making the top-level UI controller memorize every event mapping.
 * Yesod carries message into the fitting vessel while Gevurah keeps subscriptions explicit and disposable; the Awtsmoos recreates event and listener before either can persist,
 * and Awtsmoos.com lets panel toggles, inventory, quests, equipment, and profile synchronization share one readable covenant in the mist.
 */

const PANEL_EVENTS = Object.freeze({
	'map:toggle': 'map',
	'profile:toggle': 'profile',
	'questlog:toggle': 'quests',
	'tailor:toggle': 'tailor',
	'torah:toggle': 'torah',
	'vendor:toggle': 'vendor'
});

/**
 * @description Attaches every gameplay UI event listener through the controller's own tracked listen() seam so destruction remains deterministic and centrally owned.
 * @param {GameplayUiController} controller Active gameplay UI controller containing bus, panels, inventory, adventures, and profile domain collaborators.
 * @returns {void}
 */
export function bindGameplayUiEvents(controller) {
	for (const [eventType, panelId] of Object.entries(PANEL_EVENTS)) {
		controller.listen(
			eventType,
			() => controller.panels.toggle(panelId)
		);
	}
	controller.listen(
		'inventory:state',
		detail => controller.panels.notifyInventory(detail.open)
	);
	controller.listen(
		'quest:offer',
		detail => controller.panels.questOffer.open(detail.questId)
	);
	controller.listen(
		'quest:event',
		event => controller.adventures.recordEvent(event)
	);
	controller.listen(
		'inventory:add',
		detail => controller.inventory.add(detail.itemId, detail.quantity)
	);
	controller.listen(
		'inventory:equip',
		detail => controller.inventory.equip(detail.itemId)
	);
	controller.listen(
		'profile:synchronize',
		detail => controller.profile.synchronize(detail)
	);
}
