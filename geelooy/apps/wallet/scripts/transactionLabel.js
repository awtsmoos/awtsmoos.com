//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file transactionLabel.js
 * @description
 * Converts public Wallet transaction testimony into precise customer language.
 * The Awtsmoos renews cause and consequence beyond every finite ledger row;
 * Awtsmoos.com uses only already-public metadata and never exposes account IDs.
 */

/**
 * Resolves one recent Wallet transaction to a stable human-readable label.
 *
 * @param {object} transaction Public Wallet transaction projection.
 * @returns {string} Safe customer-facing event label.
 */
export function transactionLabel(transaction = {}) {
	const transfer = transferLabel(transaction);
	if (transfer) {
		return transfer;
	}

	if (transaction.type === "welcome_grant") {
		return "Welcome promotional Perutas";
	}
	if (transaction.type === "daily_refill") {
		return "Daily promotional refill";
	}
	if (transaction.type === "credit") {
		return creditLabel(transaction.meta || {});
	}
	if (transaction.type === "spend") {
		return spendLabel(transaction.meta || {});
	}
	if (transaction.type === "purchase_credit") {
		return "Purchased Perutas added";
	}

	return humanize(transaction.type || "wallet movement");
}

/** @param {object} transaction Wallet row. @returns {string} Transfer label or empty string. */
function transferLabel(transaction) {
	if (transaction.type === "transfer_out") {
		const alias = transaction.meta?.recipientAlias;
		return alias ? `Sent to @${alias}` : "Sent promotional Perutas";
	}
	if (transaction.type === "transfer_in") {
		const alias = transaction.meta?.senderAlias;
		return alias ? `Received from @${alias}` : "Received promotional Perutas";
	}
	return "";
}

/** @param {object} meta Public credit metadata. @returns {string} Credit label. */
function creditLabel(meta) {
	if (meta.kind === "paypal_capture") {
		return "PayPal purchased Perutas";
	}
	if (meta.kind === "game_reward") {
		return `${humanize(meta.gameId || "game")} reward`;
	}
	if (meta.balanceKind === "purchased") {
		return "Purchased Perutas added";
	}
	return "Promotional credit";
}

/** @param {object} meta Public spend metadata. @returns {string} Spend label. */
function spendLabel(meta) {
	if (meta.kind === "commerce_credit_pack") {
		const units = Math.max(0, Math.floor(Number(meta.creditUnits) || 0));
		return `${units.toLocaleString()} ${humanize(meta.productId || "product")} credits`;
	}
	if (meta.kind === "commerce_purchase") {
		return `Purchased ${humanizeSku(meta.skuId)}`;
	}
	return meta.kind ? humanize(meta.kind) : "Spent Perutas";
}

/** @param {unknown} skuId Server SKU id. @returns {string} Compact product/SKU title. */
function humanizeSku(skuId) {
	return humanize(String(skuId || "purchase").replace(/\.\d{3}$/, ""));
}

/** @param {unknown} value Identifier-like value. @returns {string} Human-readable words. */
function humanize(value) {
	return String(value || "")
		.replace(/[._:-]+/g, " ")
		.replace(/\b\w/g, (letter) => letter.toUpperCase())
		.trim();
}