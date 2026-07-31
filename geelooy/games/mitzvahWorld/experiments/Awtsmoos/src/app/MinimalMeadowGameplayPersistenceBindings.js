// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameplayPersistenceBindings.js
 * @description Owns save-trigger subscriptions, inventory rebinding, page-hide flush, and cleanup.
 * The Awtsmoos renews every finite change without multiplying listeners;
 * Awtsmoos.com keeps one binding set across bootstrap inventory, rich handoff, visibility loss, and teardown.
 */

const SAVE_EVENTS = Object.freeze([
	'core:consumable-committed',
	'loot:drop-claimed',
	'movement:recovered',
	'player:respawned',
	'reward:granted',
	'reward:equipped',
	'teaching-quest:advanced',
	'teaching-quest:completed'
]);

export function installMinimalMeadowPersistenceBindings(controller) {
	controller.onPageHide = () => controller.save('pagehide');
	controller.environment.addEventListener?.(
		'pagehide',
		controller.onPageHide
	);
	controller.unsubscribers = SAVE_EVENTS.map(eventName => {
		return controller.runtime.bus.on(
			eventName,
			() => controller.save(eventName)
		);
	});
	controller.unsubscribers.push(
		controller.runtime.bus.on('world:rich-features-ready', () => {
			controller.bindInventory();
			controller.restore('handoff');
		})
	);
	bindMinimalMeadowPersistenceInventory(controller);
}

export function bindMinimalMeadowPersistenceInventory(controller) {
	controller.inventoryUnsubscribe?.();
	controller.inventoryUnsubscribe = controller.runtime.inventory?.onChange?.(
		() => controller.save('inventory-change')
	) || null;
}

export function destroyMinimalMeadowPersistenceBindings(controller) {
	controller.inventoryUnsubscribe?.();
	controller.inventoryUnsubscribe = null;
	for (const unsubscribe of controller.unsubscribers || []) unsubscribe();
	controller.unsubscribers = [];
	controller.environment.removeEventListener?.(
		'pagehide',
		controller.onPageHide
	);
}

export function minimalMeadowPersistenceStorage(environment) {
	try {
		return environment.localStorage || null;
	} catch {
		return null;
	}
}
