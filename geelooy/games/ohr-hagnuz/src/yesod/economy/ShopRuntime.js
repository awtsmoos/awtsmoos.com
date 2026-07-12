/**
 * B"H
 * @module ShopRuntime
 * @description Buying, selling, stock, buyback, and mission-aware transactions.
 */
import { State } from '../../binah/State.js';
import { shopById } from '../../data/economy/ShopIndex.js';
import { recordMissionEvent } from '../../missions/MissionRuntime.js';
import { addItem, ensureBag } from '../bag/BagRuntime.js';

export const ensureEconomy = () => {
	State.Economy ||= { transactions: [], buyback: [], shopReputation: {}, stockFlags: {}, priceSeed: 1 };
	State.Economy.transactions ||= [];
	State.Economy.buyback ||= [];
	State.Economy.stockFlags ||= {};
	return State.Economy;
};

export const activeShop = () => shopById(ensureEconomy().activeShopId);

export const openShop = (id = 'village_general') => {
	const shop = shopById(id);
	if (!shop) return false;
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
	const entry = shop?.items.find(item => item.id === id);
	const bag = ensureBag();
	if (!entry) return { ok: false, reason: 'unknown-item' };
	if (stockRemaining(shop, entry) <= 0) return { ok: false, reason: 'out-of-stock' };
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
	const entry = shop?.items.find(item => item.id === id);
	const bag = ensureBag();
	if (!entry) return { ok: false, reason: 'shop-does-not-buy-item' };
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
	return shop.items.map(entry => ({
		...entry,
		owned: ensureBag().items[entry.id] || 0,
		remaining: stockRemaining(shop, entry)
	}));
};
