//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module CloudView
 * @description
 * Builds the trusted Awtsmoos Cloud conversion UI from normalized server testimony.
 * All text is assigned through textContent; buttons carry identity but never price authority.
 */

/**
 * Renders the founder-assisted offer grid.
 * @param {HTMLElement} mount Trusted Cloud offer mount.
 * @param {object} model Normalized Cloud commerce state.
 * @returns {void}
 */
export function renderCloudOffers(mount, model) {
	if (!mount) {
		return;
	}
	const cards = model.offers.map(createOfferCard);
	mount.replaceChildren(...cards);
}

/**
 * Updates the shared Cloud status with an optional visual state.
 * @param {HTMLElement} status Status vessel.
 * @param {string} message Human-readable message.
 * @param {string} [state=""] Success, error, busy, or neutral state.
 */
export function setCloudStatus(status, message, state = "") {
	if (!status) {
		return;
	}
	status.textContent = message;
	status.dataset.state = state;
}

/** Creates one trusted offer card from server-derived presentation testimony. */
function createOfferCard(offer) {
	const card = element("article", "cloud-offer-card");
	card.dataset.offerCode = offer.code;
	card.append(
		text("p", "cloud-offer-kicker", offer.code === "agency" ? "For repeat delivery" : "Founding reservation"),
		text("h3", "", offer.title),
		text("p", "cloud-offer-short", offer.shortDescription),
		priceBlock(offer),
		text("p", "cloud-offer-terms", offer.description),
		actionButton(offer)
	);
	return card;
}

/** Creates the prominent server-derived price block. */
function priceBlock(offer) {
	const block = element("div", "cloud-offer-price");
	const dollars = offer.dollars > 0 ? `$${offer.dollars.toFixed(0)}` : "Live price";
	block.append(
		text("strong", "", dollars),
		text("span", "", `${offer.pricePerutahs.toLocaleString()} purchased Perutas`)
	);
	return block;
}

/** Creates the next-action button without embedding mutable financial state. */
function actionButton(offer) {
	const button = text("button", "cloud-offer-button", buttonLabel(offer));
	button.type = "button";
	button.dataset.cloudReserve = offer.id;
	button.dataset.cloudAction = actionName(offer);
	button.disabled = offer.owned;
	return button;
}

/** Returns the next financial action represented by one offer. */
function actionName(offer) {
	if (offer.owned) {
		return "owned";
	}
	if (!offer.authenticated) {
		return "login";
	}
	if (offer.needsFunding) {
		return "fund";
	}
	return "purchase";
}

/** Returns truthful CTA text for one offer state. */
function buttonLabel(offer) {
	const action = actionName(offer);
	return ({
		fund: `Fund Wallet for ${offer.dollars.toFixed(0)} reservation`,
		login: "Sign in to reserve",
		owned: "Reservation owned",
		purchase: `Reserve for $${offer.dollars.toFixed(0)}`
	})[action];
}

/** Creates one trusted DOM element with no parsed HTML. */
function element(tagName, className = "") {
	const node = document.createElement(tagName);
	node.className = className;
	return node;
}

/** Creates one text-only trusted element. */
function text(tagName, className, value) {
	const node = element(tagName, className);
	node.textContent = value;
	return node;
}
