// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShopRuntime.js
 * @description Buying, selling, stock, buyback, and restored-road trade values.
 *
 * The Awtsmoos recreates buyer, seller, coin, and need without becoming any of
 * them. This market remembers that a safer road changes earthly cost while
 * entrusted gifts remain beyond sale in the world of Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { shopById } from '../../data/economy/ShopIndex.js';
import { recordMissionEvent } from '../../missions/MissionRuntime.js';
import { addItem, ensureBag } from '../bag/BagRuntime.js';
import { adjustedTradeValues, bentReedsMerchantAvailable } from './BentReedsTradePolicy.js';

export const ensureEconomy = () => {
	State.Economy ||= { transactions: [], buyback: [], shopReputation: {}, stockFlags: {}, priceSeed: 1 };
	State.Economy.transactions ||= [];
	State.Economy.buyback ||= [];
	State.Economy.stockFlags ||= {};
	return State.Economy;
};

const pricedEntry = (shop, entry) => ({
	...entry,
	...adjustedTradeValues(shop.id, entry)
});

export const activeShop = () => shopById(ensureEconomy().activeShopId);

export const openShop = (id = 'village_general') => {
	const shop = shopById(id);
	if (!shop) return false;
	if (!bentReedsMerchantAvailable(id)) {
		State.say('The Bent Reeds merchant has not returned to the dark road.', 360);
		return false;
	}
	ensureEconomy().activeShopId = id;
	State.openPanel('shop');
	State.say(`${shop.name} opened. Buy and sell ordinary goods; entrusted gifts are protected.`, 320);
	return true;
};

const stockRemaining = (shop, entry) => {
	if (entry.stock == null) return Infinity;
	const sold = ensureEconomy().stockFlags[`${shop.id}:${entry.id}`] || 0;
	return Math.max(0, entry.stock - sold);
};

const recordTransaction = transaction => {
	ensureEconomy().transactions.unshift({ ...transaction, at: Date.now() });
	State.Economy.transactions = State.Economy.transactions.slice(0, 60);
};

export const buyItem = id => {
	const shop = activeShop();
	const source = shop?.items.find(item => item.id === id);
	const bag = ensureBag();
	if (!source) return { ok: false, reason: 'unknown-item' };
	const entry = pricedEntry(shop, source);
	if (stockRemaining(shop, source) <= 0) return { ok: false, reason: 'out-of-stock' };
	if (bag.money < entry.buy) return { ok: false, reason: 'not-enough-zuzim' };
	bag.money -= entry.buy;
	addItem(id, 1);
	State.Economy.stockFlags[`${shop.id}:${id}`] = (State.Economy.stockFlags[`${shop.id}:${id}`] || 0) + 1;
	recordTransaction({ type: 'buy', shopId: shop.id, itemId: id, amount: 1, value: entry.buy });
	recordMissionEvent('SHOP_BUY', id, { shopId: shop.id });
	State.say(`Bought ${entry.name} for ${entry.buy} zuz.`, 260);
	return { ok: true, entry, money: bag.money };
};

export const sellItem = id => {
	const shop = activeShop();
	const source = shop?.items.find(item => item.id === id);
	const bag = ensureBag();
	if (!source) return { ok: false, reason: 'shop-does-not-buy-item' };
	const entry = pricedEntry(shop, source);
	if ((bag.items[id] || 0) <= 0) return { ok: false, reason: 'item-not-owned' };
	bag.items[id] -= 1;
	bag.money += entry.sell;
	State.Economy.buyback.unshift({ shopId: shop.id, itemId: id, price: entry.buy, at: Date.now() });
	State.Economy.buyback = State.Economy.buyback.slice(0, 12);
	recordTransaction({ type: 'sell', shopId: shop.id, itemId: id, amount: 1, value: entry.sell });
	recordMissionEvent('SHOP_SELL', id, { shopId: shop.id });
	State.say(`Sold ${entry.name} for ${entry.sell} zuz.`, 260);
	return { ok: true, entry, money: bag.money };
};

export const shopRows = () => {
	const shop = activeShop();
	if (!shop) return [];
	return shop.items.map(source => ({
		...pricedEntry(shop, source),
		owned: ensureBag().items[source.id] || 0,
		remaining: stockRemaining(shop, source)
	}));
};
