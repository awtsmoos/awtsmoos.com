// B"H
// Boruch Hashem
// Blessed is He

/**
 * Reduces Wallet API responses into the only state the universal product store
 * needs. Native premium goods are deliberately excluded: this surface owns the
 * universal supporter ladder and server-authoritative consumable credit packs.
 */
export function buildProductCommerceModel(identity, catalog, commerce, balance) {
	const entitlements = commerce.ok ? commerce.entitlements || [] : [];
	const owned = new Set(entitlements.flatMap(item => [item.key, item.skuId]).filter(Boolean));
	const creditState = (commerce.productCredits || []).find(item => item.productId === identity.id) || {};
	const offers = (catalog.ok ? catalog.skus || [] : [])
		.filter(sku => sku.productId === identity.id)
		.filter(isUniversalCommerceSku)
		.filter(sku => sku.available)
		.map(sku => Object.freeze({
			id: sku.id,
			title: sku.title,
			description: sku.description,
			kind: sku.kind,
			pricePerutahs: Number(sku.pricePerutahs) || 0,
			priceLabel: formatPerutas(sku.pricePerutahs),
			creditUnits: Number(sku.creditUnits) || 0,
			creditLabel: sku.creditLabel || "Credits",
			owned: sku.kind === "durable_entitlement" && owned.has(sku.id)
		}))
		.sort((left, right) => offerRank(left) - offerRank(right) || left.pricePerutahs - right.pricePerutahs);
	const wallet = balance.ok ? balance.wallet || {} : {};
	const rate = Number(balance.pricing?.perutahsPerUsdCent) || 0;
	return Object.freeze({
		authenticated: Boolean(balance.ok && commerce.ok),
		purchasedBalance: Number(wallet.purchasedBalance) || 0,
		productCreditBalance: Number(creditState.balance) || 0,
		productCreditLifetime: Number(creditState.lifetimePurchased) || 0,
		perutahsPerDollar: rate * 100,
		offers
	});
}

function offerRank(offer) {
	return offer.kind === "consumable_credit_pack" ? 0 : 1;
}

/** @param {object} sku @returns {boolean} */
export function isSupporterSku(sku) {
	return String(sku?.id || "").includes(".supporter.");
}

/** @param {object} sku @returns {boolean} */
export function isUniversalCommerceSku(sku) {
	return isSupporterSku(sku)
		|| String(sku?.id || "").includes(".template.")
		|| sku?.kind === "consumable_credit_pack";
}

/** @param {number|string} value @returns {string} */
export function formatPerutas(value) {
	return `${Math.max(0, Math.floor(Number(value) || 0)).toLocaleString()} Perutas`;
}
