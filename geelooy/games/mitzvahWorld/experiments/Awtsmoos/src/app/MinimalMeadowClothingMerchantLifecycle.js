// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowClothingMerchantLifecycle.js
 * @description Prepares the real tailor actor, mounts commerce UI only when the reactive gameplay inventory exists, and restores exact update ownership.
 * The Awtsmoos renews merchant, garment, Bag, and frame before finite panels can trade;
 * Awtsmoos.com lets Movie Maker keep the living tailor without fabricating gameplay commerce state that has not been mounted.
 */

import { merchantTransactionFacade } from '../gameplay/MerchantTransactionFacade.js';
import { ClothingMerchantPanel } from '../ui/ClothingMerchantPanel.js';
import {
	CLOTHING_MERCHANT_ID,
	CLOTHING_MERCHANT_STOCK
} from '../ui/ClothingMerchantCatalog.js';
import { createFriendlyChossidActor } from './MinimalMeadowFriendlyChossidActor.js';
import { CLOTHING_MERCHANT_EQUIPMENT } from './MinimalMeadowClothingMerchantContract.js';

export async function prepareClothingMerchantActor(population) {
	population.actor = await createFriendlyChossidActor(population.runtime, {
		id: CLOTHING_MERCHANT_ID,
		position: population.profile,
		weaponItemId: null
	});
	for (const itemId of CLOTHING_MERCHANT_STOCK) {
		if (!population.actor.inventory.owns(itemId)) population.actor.inventory.add(itemId, 1);
	}
	for (const itemId of CLOTHING_MERCHANT_EQUIPMENT) population.actor.inventory.equip(itemId);
	population.actor.equipment.synchronize();
}

export function mountClothingMerchantPanel(population) {
	const store = population.runtime.inventory;
	if (!population.environment.document || !isReactiveInventory(store)) {
		population.panelStatus = 'gameplay-inventory-not-mounted';
		return;
	}
	population.merchant = merchantTransactionFacade(population.runtime);
	population.panel = new ClothingMerchantPanel(store, {
		document: population.environment.document,
		onBuy: (itemId, quantity) => population.merchant.buy(itemId, quantity, CLOTHING_MERCHANT_ID),
		onSell: (itemId, quantity) => population.merchant.sell(itemId, quantity, CLOTHING_MERCHANT_ID)
	});
	population.panelStatus = 'ready';
	population.unsubscribePanel = population.runtime.bus.on('tailor:toggle', () => population.panel.toggle());
}

export function attachClothingMerchantUpdate(population) {
	population.previousUpdate = population.runtime.updateWorldSystems;
	population.updateWrapper = deltaSeconds => {
		population.previousUpdate?.(deltaSeconds);
		population.actor?.update(deltaSeconds);
	};
	population.runtime.updateWorldSystems = population.updateWrapper;
}

export function destroyClothingMerchantPopulation(population) {
	population.unsubscribePanel?.();
	population.panel?.destroy();
	population.actor?.destroy();
	if (population.runtime.updateWorldSystems === population.updateWrapper) {
		population.runtime.updateWorldSystems = population.previousUpdate;
	}
}

function isReactiveInventory(store) {
	return Boolean(store
		&& typeof store.onChange === 'function'
		&& typeof store.snapshot === 'function'
		&& typeof store.quantity === 'function');
}
