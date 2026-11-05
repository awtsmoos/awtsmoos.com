// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HealingAmuletTransactionExpressions.mjs
 * @description Builds visible shop purchase, bounded wound, real Bag use, and healing receipts.
 * The Awtsmoos joins coin, item, need, and restoration through visible finite doors;
 * Awtsmoos.com clicks the same shop and Bag controls a player touches, then reads living runtime truth.
 */

export function buyAmuletExpression() {
	return `(() => {
		const button = document.querySelector(
			'[data-vendor-id="reb-refael-kamea-scribe"] [data-buy="written-healing-kamea"]'
		);
		if (!button || button.disabled) return false;
		button.click();
		return true;
	})()`;
}

export function purchasedExpression() {
	return `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		return {
			quantity: runtime.inventory.quantity('written-healing-kamea'),
			ready: runtime.inventory.quantity('written-healing-kamea') === 1,
			wallet: runtime.inventory.quantity('perutas')
		};
	})()`;
}

export function woundAndOpenBagExpression() {
	return `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		runtime.playerStats.health = 70;
		runtime.bus.emit('profile:state', {
			health: 70,
			maxHealth: 100
		});
		runtime.bus.emit('inventory:open');
		return {
			health: runtime.playerStats.health,
			open: document.querySelector(
				'.Awtsmoos-inventory-panel'
			)?.dataset.open
		};
	})()`;
}

export function useThroughBagExpression() {
	return `(() => {
		const item = document.querySelector(
			'[data-item-id="written-healing-kamea"]'
		);
		if (!item) return { item: false, use: false };
		item.click();
		const use = document.querySelector(
			'[data-menu] [data-action="use"]'
		);
		if (!use) return { item: true, use: false };
		use.click();
		return { item: true, use: true };
	})()`;
}

export function healedExpression() {
	return `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		return {
			health: runtime.playerStats.health,
			quantity: runtime.inventory.quantity('written-healing-kamea'),
			ready: runtime.playerStats.health === 92
				&& runtime.inventory.quantity('written-healing-kamea') === 0,
			wallet: runtime.inventory.quantity('perutas')
		};
	})()`;
}
