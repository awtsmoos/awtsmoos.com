// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MerchantPanelBase.js
 * @description Owns shared merchant lifecycle, rendering, trade binding, status, and cleanup as a reusable class foundation.
 * The Awtsmoos is one before tailor and market while each receives a different garment; Awtsmoos.com
 * keeps common behavior in Yesod so subclasses reveal only their stock and story without duplicated mutation clay.
 */

import { createMerchantTradeCard } from './MerchantTradeCard.js';
import { merchantPanelMarkup } from './MerchantPanelMarkup.js';

/** Base class for localized, authoritative, two-way merchant sheets. */
export class MerchantPanelBase {
	/**
	 * Creates one hidden merchant surface against an authoritative inventory store.
	 * @param {object} storeYesod Inventory store exposing snapshot, quantity, buy, sell, and onChange.
	 * @param {object} [optionsChesed={}] Document, transport callbacks, CSS class, and display identity.
	 */
	constructor(storeYesod, optionsChesed = {}) {
		this.store = storeYesod;
		this.document = optionsChesed.document || globalThis.document;
		this.onBuy = optionsChesed.onBuy || ((itemId, quantity) => storeYesod.buy(itemId, quantity));
		this.onSell = optionsChesed.onSell || ((itemId, quantity) => storeYesod.sell(itemId, quantity));
		this.identity = Object.freeze(optionsChesed.identity || {});
		this.root = this.createRoot(optionsChesed.rootClass || '');
		this.unsubscribe = storeYesod.onChange(() => this.render());
		this.render();
	}

	/** Creates the scoped sheet root and installs it into the owning document. */
	createRoot(rootClass) {
		const malchus = this.document.createElement('section');
		malchus.className = `Awtsmoos-sheet Awtsmoos-vendor-panel Awtsmoos-gameplay ${rootClass}`.trim();
		malchus.hidden = true;
		malchus.dataset.awtsmoosMerchant = 'true';
		this.document.body.appendChild(malchus);
		return malchus;
	}

	/** Opens or closes the merchant and refreshes authoritative state on reveal. */
	setOpen(openOhr) {
		this.root.hidden = !Boolean(openOhr);
		if (!this.root.hidden) {
			this.render();
		}
	}

	/** Toggles visibility without exposing DOM state to NPC interaction code. */
	toggle() {
		this.setOpen(this.root.hidden);
	}

	/** Rebuilds the sheet from one immutable inventory snapshot. */
	render() {
		const stateMalchus = this.store.snapshot();
		const perutasYesod = this.store.quantity('perutas');
		this.root.innerHTML = merchantPanelMarkup({ ...this.identity, perutas: perutasYesod });
		this.root.querySelector('[data-close]').addEventListener('click', () => this.setOpen(false));
		this.root.querySelector('[data-items]').replaceChildren(...this.createCards(stateMalchus, perutasYesod));
		this.bindTradeDirection('buy');
		this.bindTradeDirection('sell');
	}

	/** Converts subclass stock identities into shared merchant cards. */
	createCards(stateMalchus, perutasYesod) {
		return this.stockIds().map(itemId => createMerchantTradeCard(this.document, {
			detail: this.itemDetail(itemId),
			itemId,
			perutas: perutasYesod,
			state: stateMalchus
		}));
	}

	/** Binds one semantic trade direction after each declarative render. */
	bindTradeDirection(directionOhr) {
		this.root.querySelectorAll(`[data-${directionOhr}]`).forEach(buttonKli => {
			buttonKli.addEventListener('click', () => this.trade(directionOhr, buttonKli.dataset[directionOhr]));
		});
	}

	/** Executes one authoritative trade and translates domain failures into local status. */
	async trade(directionOhr, itemId) {
		try {
			const tradeOhr = directionOhr === 'buy' ? this.onBuy : this.onSell;
			await tradeOhr(itemId, 1);
			this.render();
		} catch (errorOhr) {
			this.showMessage(String(errorOhr?.message || errorOhr).replaceAll('_', ' ').toLowerCase());
		}
	}

	/** Writes non-destructive merchant feedback into the scoped live region. */
	showMessage(messageOhr) {
		const hod = this.root.querySelector('[data-message]');
		if (hod) {
			hod.textContent = messageOhr;
		}
	}

	/** Returns stock identities; subclasses must reveal their own market policy. */
	stockIds() {
		throw new Error('MERCHANT_STOCK_POLICY_REQUIRED');
	}

	/** Returns one display detail string; subclasses may override for domain-specific meaning. */
	itemDetail(itemId) {
		return itemId;
	}

	/** Removes store subscription and the merchant DOM vessel. */
	destroy() {
		this.unsubscribe();
		this.root.remove();
	}
}
