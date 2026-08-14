// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Owns pre-transaction commerce validation without reading or writing Wallet state.
 * The Awtsmoos renews caller, product, and boundary in one source; Awtsmoos.com
 * keeps these finite gates pure so invalid requests never enter the treasury lock.
 */

/**
 * Normalizes a caller-supplied idempotency key.
 *
 * @param {*} rawKey
 * 	Untrusted request key.
 * @returns {string|null}
 * 	Validated key or null.
 */
function normalizeIdempotencyKey(rawKey) {
	const key = String(rawKey || "").trim();
	return key.length >= 8 && key.length <= 128 ? key : null;
}

/**
 * Validates SKU availability and durable-commerce support before locking storage.
 *
 * @param {object|null} sku
 * 	Server-known SKU or null.
 * @param {*} rawIdempotencyKey
 * 	Untrusted caller operation key.
 * @returns {{ok: true, idempotencyKey: string}|{ok: false, error: string, skuId?: string}}
 * 	Validated inputs or a stable failure.
 */
function validatePurchaseRequest(sku, rawIdempotencyKey) {
	const idempotencyKey = normalizeIdempotencyKey(rawIdempotencyKey);

	if (!idempotencyKey) {
		return { ok: false, error: "invalid_idempotency_key" };
	}

	if (!sku) {
		return { ok: false, error: "unknown_sku" };
	}

	if (!sku.available) {
		return { ok: false, error: "sku_unavailable", skuId: sku.id };
	}

	if (sku.kind !== "durable_entitlement") {
		return { ok: false, error: "unsupported_sku_kind", skuId: sku.id };
	}

	return {
		ok: true,
		idempotencyKey
	};
}

module.exports = {
	normalizeIdempotencyKey,
	validatePurchaseRequest
};
