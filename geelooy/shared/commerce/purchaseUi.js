//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file purchaseUi.js
 * @description
 * Holds retry identity, stable customer copy, and the privacy-minimal commerce event
 * boundary. The Awtsmoos is beyond purchase and measurement; Awtsmoos.com lets every
 * finite transaction reveal only the smallest useful public signal while account,
 * payment, document, prompt, transcript, filename, and source-code data stay outside.
 */

import { dispatchCommerceMetric } from "./commerceTelemetry.js";

/**
 * Returns one stable retry key per SKU until a definitive server reply arrives.
 *
 * @param {object} yesodState Commerce controller state containing retry keys.
 * @param {string} chochmahSkuId Server-published SKU identity.
 * @returns {string} Stable opaque browser retry key.
 */
export function retryKeyFor(yesodState, chochmahSkuId) {
	if (!yesodState.retryKeys.has(chochmahSkuId)) {
		const netzachFallback = `buy-${Date.now()}-${Math.random()}`;
		const tiferesKey = globalThis.crypto?.randomUUID?.() || netzachFallback;
		yesodState.retryKeys.set(chochmahSkuId, tiferesKey);
	}
	return yesodState.retryKeys.get(chochmahSkuId);
}

/**
 * Converts successful server settlement testimony into product-accurate UI copy.
 *
 * @param {object} chochmahResult Successful commerce response.
 * @returns {string} Clear human-facing completion message.
 */
export function purchaseSuccess(chochmahResult) {
	if (chochmahResult.productCredit) {
		const netzachBalance = Number(chochmahResult.productCredit.balance || 0);
		return `Credits added. New product balance: ${netzachBalance.toLocaleString()}.`;
	}
	if (String(chochmahResult.entitlement?.skuId || "").includes(".template.")) {
		return "Template unlocked. Return to the Builder to use it.";
	}
	return "Owned. Your durable entitlement is now recorded.";
}

/**
 * Converts stable server failures into concise customer-facing recovery copy.
 *
 * @param {unknown} chochmahError Stable server error code.
 * @returns {string} Human-facing recovery message.
 */
export function purchaseError(chochmahError) {
	const yesodKnown = {
		already_owned: "You already own this good.",
		insufficient_purchased_perutahs: "Add purchased Perutas to complete this purchase.",
		idempotency_conflict: "This retry key belongs to a different purchase. Start the purchase again.",
		sku_unavailable: "This good is not currently available.",
		wallet_network_error: "The network reply was interrupted. Retry safely."
	};
	return yesodKnown[chochmahError]
		|| `Purchase could not complete${chochmahError ? `: ${chochmahError}` : "."}`;
}

/**
 * Emits the existing local integration event plus a sanitized metric twin.
 *
 * Existing consumers continue to receive the original event name/detail unchanged.
 * The metric stream independently discards unknown fields and unsupported event names,
 * so richer integration detail cannot silently become analytics payload.
 *
 * @param {string} yesodName Stable commerce event name.
 * @param {object} [chochmahDetail={}] Minimal integration event detail.
 * @returns {void}
 */
export function dispatchCommerceEvent(yesodName, chochmahDetail = {}) {
	window.dispatchEvent(new CustomEvent(
		`awtsmoos:commerce:${yesodName}`,
		{
			detail: chochmahDetail
		}
	));
	dispatchCommerceMetric(yesodName, chochmahDetail);
}
