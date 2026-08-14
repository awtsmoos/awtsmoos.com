// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Builds one optional Wallet good from normalized server testimony. The Awtsmoos
 * renews title, badge, price, and owner beyond every finite card; Awtsmoos.com keeps
 * this vessel presentation-only so no button can invent a price, SKU, or entitlement.
 */

/**
 * Creates one Treasury Shop product card.
 *
 * @param {object} item Normalized live Wallet product.
 * @param {boolean} authenticated Whether purchase may be offered.
 * @returns {HTMLElement} Text-safe product card.
 */
export function createProductCard(item, authenticated) {
	const card = document.createElement("article");
	card.className = "treasury-good";
	card.dataset.skuId = item.id;
	card.append(
		text("span", "treasury-good__badge", badgeLabel(item)),
		text("h3", "", item.title),
		text("p", "", item.description),
		text(
			"strong",
			"treasury-good__price",
			`${item.pricePerutahs} Perutahs`
		)
	);

	const button = text(
		"button",
		"treasury-good__button",
		buttonLabel(item, authenticated)
	);
	button.type = "button";
	button.dataset.commerceBuy = item.id;
	button.dataset.owned = String(item.owned);
	button.disabled = item.owned || !authenticated;
	card.append(button);
	return card;
}

function badgeLabel(item) {
	if (item.owned) {
		return "Owned";
	}
	return item.spendPolicy === "purchased_only"
		? "Purchased Perutas only"
		: "Wallet Perutas";
}

function buttonLabel(item, authenticated) {
	if (item.owned) {
		return "Owned";
	}
	if (!authenticated) {
		return "Sign in to buy";
	}
	return `Buy for ${item.pricePerutahs}`;
}

function text(tagName, className, value) {
	const element = document.createElement(tagName);
	element.className = className;
	element.textContent = value;
	return element;
}
