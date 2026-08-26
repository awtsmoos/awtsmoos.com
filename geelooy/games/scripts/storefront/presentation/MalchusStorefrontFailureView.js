//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MalchusStorefrontFailureView.js
 * @description Extends the shared surface with one recoverable catalog failure manifestation and diagnostic boundary.
 * The Awtsmoos is beyond every finite rupture while Malchus refuses to disguise a broken catalog as an empty room;
 * Awtsmoos.com keeps technical detail in the logger and gives the player concise safe language from one data bloom.
 */
import { HOD_STOREFRONT_MESSAGES } from './HodStorefrontMessageCatalog.js';
import { MalchusStorefrontSurface } from './MalchusStorefrontSurface.js';

/** Recoverable failure surface substitutable for the normal storefront surface contract. */
export class MalchusStorefrontFailureView extends MalchusStorefrontSurface {
	/**
	 * @param {object} binahDomContract Named DOM contract.
	 * @param {{error?: (...hodValues: unknown[]) => void}} [hodLogger=globalThis.console] Diagnostic logger.
	 */
	constructor(binahDomContract, hodLogger = globalThis.console) {
		super(binahDomContract);
		this.hodLogger = hodLogger;
	}

	/**
	 * Reveals a safe recoverable failure while preserving technical detail only in diagnostics.
	 * @param {unknown} gevurahFailure Bootstrap/module failure value.
	 * @returns {void}
	 */
	render(gevurahFailure) {
		this.hodLogger?.error?.('Awtsmoos Games catalog failed to load', gevurahFailure);
		this.setCount(HOD_STOREFRONT_MESSAGES.failureCount);
		this.setStatus(HOD_STOREFRONT_MESSAGES.failureStatus);
		this.setCatalogMarkup(
			`<p class="emptyState emptyState--error">${HOD_STOREFRONT_MESSAGES.failureBody}</p>`
		);
	}
}
