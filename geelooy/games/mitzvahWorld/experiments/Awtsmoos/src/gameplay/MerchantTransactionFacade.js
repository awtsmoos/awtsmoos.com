// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MerchantTransactionFacade.js
 * @description Unifies local and multiplayer buying and selling through inspectable receipts.
 * The Awtsmoos joins coin, garment, authority, and witness without duplicating the Bag;
 * Awtsmoos.com emits one honest receipt after narrow reconciliation completes its path.
 */

import {
	authoritativeMerchantEconomy,
	merchantCommandQuantity,
	merchantRemoteAction,
	merchantResponsePayload,
	reconcileMerchantAuthority
} from './MerchantAuthorityReconciliation.js';

export class MerchantTransactionFacade {
	constructor(options) {
		this.options = options;
		this.bus = options.bus;
		this.inventory = options.inventory;
		this.lastReceipt = null;
	}

	buy(itemId, quantity = 1, vendorId = null) {
		return this.transact('buy', itemId, quantity, vendorId);
	}

	sell(itemId, quantity = 1, vendorId = null) {
		return this.transact('sell', itemId, quantity, vendorId);
	}

	async transact(operation, itemId, quantity, vendorId) {
		const count = merchantCommandQuantity(quantity);
		const action = merchantRemoteAction(this.options, operation);
		let authority = 'local';
		let responseType = null;
		if (action) {
			const message = await action(itemId, count, vendorId);
			const payload = merchantResponsePayload(message);
			reconcileMerchantAuthority(this.inventory, itemId, payload);
			authority = 'remote';
			responseType = message?.type || null;
		} else {
			this.inventory[operation](itemId, count);
		}
		return this.publish({
			authority,
			itemId,
			operation,
			quantity: count,
			responseType,
			vendorId
		});
	}

	publish(detail) {
		const receipt = Object.freeze({
			accepted: true,
			...detail,
			itemQuantity: this.inventory.quantity(detail.itemId),
			perutas: this.inventory.quantity('perutas')
		});
		this.lastReceipt = receipt;
		this.bus?.emit?.('merchant:receipt', receipt);
		this.bus?.emit?.(
			`merchant:${detail.operation === 'buy' ? 'bought' : 'sold'}`,
			receipt
		);
		return receipt;
	}

	snapshot() {
		return this.lastReceipt;
	}
}

export function merchantTransactionFacade(runtime) {
	runtime.merchant ||= new MerchantTransactionFacade({
		bus: runtime.bus,
		economy: () => authoritativeMerchantEconomy(runtime),
		inventory: runtime.inventory
	});
	return runtime.merchant;
}
