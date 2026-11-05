// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MerchantAuthorityReconciliation.js
 * @description Resolves remote commerce commands and reconciles narrow authoritative state.
 * The Awtsmoos permits distant judgment without erasing the nearby Bag;
 * Awtsmoos.com replaces only traded quantity and Perutas while unrelated possessions never lag.
 */

export function merchantRemoteAction(options, operation) {
	const direct = operation === 'buy'
		? options.buyAction
		: options.sellAction;
	if (direct) return direct;
	const economy = typeof options.economy === 'function'
		? options.economy()
		: options.economy;
	const method = economy?.[operation];
	return method ? method.bind(economy) : null;
}

export function merchantResponsePayload(message) {
	const payload = message?.payload || message;
	if (!payload || payload.accepted === false) {
		throw new Error(payload?.reason || 'MERCHANT_AUTHORITY_REJECTED');
	}
	return payload;
}

export function reconcileMerchantAuthority(inventory, itemId, payload = {}) {
	if (!inventory?.serializableState || !inventory?.restore) return null;
	const state = payload.state || payload;
	const authorityItems = authorityInventory(state);
	const walletValue = state.wallet?.mitzvahCoins
		?? state.wallet?.perutas
		?? state.perutas;
	if (!authorityItems && walletValue === undefined) return null;
	const current = inventory.serializableState();
	const items = current.items.filter(stack => preserveStack(
		stack,
		itemId,
		authorityItems,
		walletValue
	));
	appendAuthoritativeItem(items, authorityItems, itemId);
	appendAuthoritativeWallet(items, walletValue);
	return inventory.restore({ ...current, items });
}

export function merchantCommandQuantity(value) {
	const quantity = Number(value);
	if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
		throw new Error('INVALID_MERCHANT_QUANTITY');
	}
	return quantity;
}

export function authoritativeMerchantEconomy(runtime) {
	const bridge = runtime.multiplayerBridge;
	if (!bridge || bridge.transport === 'local-tab') return null;
	if (bridge.state !== 'connected') return null;
	return bridge.client?.mmorpg?.economy || null;
}

function authorityInventory(state) {
	if (Array.isArray(state.inventory)) return state.inventory;
	if (Array.isArray(state.items)) return state.items;
	return null;
}

function preserveStack(stack, itemId, authorityItems, walletValue) {
	if (authorityItems && stack.itemId === itemId) return false;
	if (walletValue !== undefined && stack.itemId === 'perutas') return false;
	return true;
}

function appendAuthoritativeItem(items, authorityItems, itemId) {
	if (!authorityItems) return;
	const quantity = authorityItems
		.filter(stack => stack.itemId === itemId)
		.reduce((total, stack) => (
			total + Math.max(0, Number(stack.quantity) || 0)
		), 0);
	if (quantity > 0) items.push({ itemId, quantity });
}

function appendAuthoritativeWallet(items, walletValue) {
	if (walletValue === undefined) return;
	const quantity = Math.max(0, Number(walletValue) || 0);
	if (quantity > 0) items.push({ itemId: 'perutas', quantity });
}
