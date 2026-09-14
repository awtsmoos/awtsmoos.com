//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file creditPortfolioModel.js
 * @description
 * Joins authenticated product-credit balances to the server-verified public product
 * directory. The Awtsmoos renews value and doorway beyond every finite record;
 * Awtsmoos.com therefore never guesses a route from a Wallet product identifier.
 */

/**
 * Builds the immutable customer-facing product-credit portfolio.
 *
 * @param {object} commerce Authenticated commerce account response.
 * @param {object} directory Public verified product-directory response.
 * @returns {ReadonlyArray<Readonly<object>>} Sorted non-empty credit holdings.
 */
export function buildCreditPortfolio(commerce = {}, directory = {}) {
	const products = new Map(
		(directory.products || []).map(product => [String(product.id), product])
	);
	const rows = (commerce.productCredits || [])
		.map(credit => portfolioRow(credit, products.get(String(credit.productId))))
		.filter(row => row.balance > 0 || row.lifetimePurchased > 0)
		.sort(comparePortfolioRows);

	return Object.freeze(rows);
}

/**
 * Normalizes one balance without manufacturing an unverifiable product doorway.
 *
 * @param {object} credit Server-owned product-credit state.
 * @param {object|undefined} product Verified public product metadata.
 * @returns {Readonly<object>} Stable presentation model.
 */
function portfolioRow(credit, product) {
	const lifetimePurchased = whole(credit.lifetimePurchased);
	const lifetimeConsumed = whole(credit.lifetimeConsumed);

	return Object.freeze({
		productId: String(credit.productId || ""),
		title: String(product?.title || credit.productId || "Product credits"),
		kind: String(product?.kind || "product"),
		route: product?.route ? String(product.route) : "",
		balance: whole(credit.balance),
		lifetimePurchased,
		lifetimeConsumed,
		usedPercent: lifetimePurchased > 0
			? Math.min(100, Math.round(lifetimeConsumed / lifetimePurchased * 100))
			: 0
	});
}

/** @param {unknown} value Finite numeric testimony. @returns {number} Non-negative whole units. */
function whole(value) {
	return Math.max(0, Math.floor(Number(value) || 0));
}

/**
 * Keeps useful holdings first while preserving deterministic alphabetical ties.
 *
 * @param {Readonly<object>} left First portfolio row.
 * @param {Readonly<object>} right Second portfolio row.
 * @returns {number} Array sort comparison value.
 */
function comparePortfolioRows(left, right) {
	if (right.balance !== left.balance) {
		return right.balance - left.balance;
	}

	return left.title.localeCompare(right.title);
}
