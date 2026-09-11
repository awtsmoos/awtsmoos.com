// B"H
// Boruch Hashem
// Blessed is He

import { formatPerutas } from "./model.js";

/** Renders only the current product's server-live goods and current ownership. */
export function renderCommerce(surface, model, identity) {
	surface.balanceValue.textContent = model.authenticated
		? formatPerutas(model.purchasedBalance)
		: "Sign in to view";
	surface.creditValue.textContent = model.authenticated
		? `${model.productCreditBalance.toLocaleString()} credits`
		: "Sign in to view";
	surface.account.textContent = model.authenticated ? "Account active" : "Sign in";
	surface.account.href = model.authenticated
		? "/apps/wallet/"
		: `/login?next=${encodeURIComponent(currentReturnPath())}`;
	renderTopUps(surface, model);
	surface.offers.replaceChildren();
	if (!model.offers.length) {
		surface.offers.append(message("No paid goods are live for this product yet."));
		return;
	}
	const creditPacks = model.offers.filter(offer => offer.kind === "consumable_credit_pack");
	const supporter = model.offers.filter(offer => offer.kind === "durable_entitlement");
	appendOfferGroup(surface.offers, `${identity.title} credits`, creditPacks, model.authenticated);
	appendOfferGroup(surface.offers, "Supporter ownership", supporter, model.authenticated);
}

export function setCommerceStatus(surface, value, tone = "") {
	surface.status.textContent = value;
	surface.status.dataset.tone = tone;
}

export function setCommerceBusy(surface, busy) {
	surface.root.dataset.busy = busy ? "true" : "false";
	surface.dialog.setAttribute("aria-busy", busy ? "true" : "false");
}

function offerCard(offer, authenticated) {
	const card = document.createElement("article");
	card.className = "awts-commerce__offer";
	const title = document.createElement("strong");
	title.textContent = offer.title;
	const description = document.createElement("p");
	description.textContent = offer.description || "Durable account entitlement.";
	const price = document.createElement("span");
	price.textContent = offer.priceLabel;
	const action = document.createElement("button");
	action.type = "button";
	action.dataset.commerceSku = offer.id;
	const creditPack = offer.kind === "consumable_credit_pack";
	action.disabled = !creditPack && offer.owned;
	action.textContent = creditPack
		? authenticated ? `Buy ${offer.creditUnits} credits` : "Sign in to buy"
		: offer.owned ? "Owned" : authenticated ? "Own this" : "Sign in to own";
	card.append(title, description, price, action);
	return card;
}

function appendOfferGroup(container, title, offers, authenticated) {
	if (!offers.length) return;
	const heading = document.createElement("h3");
	heading.textContent = title;
	container.append(heading);
	for (const offer of offers) container.append(offerCard(offer, authenticated));
}

function renderTopUps(surface, model) {
	for (const button of surface.topups.querySelectorAll("[data-commerce-topup]")) {
		const dollars = Number(button.dataset.commerceTopup) || 0;
		const perutas = dollars * model.perutahsPerDollar;
		button.textContent = perutas > 0
			? `$${dollars} · ${Number(perutas).toLocaleString()} P`
			: `$${dollars}`;
	}
}

function currentReturnPath() {
	const url = new URL(window.location.href);
	url.searchParams.set("commerce", "1");
	return `${url.pathname}${url.search}`;
}

function message(value) {
	const node = document.createElement("p");
	node.className = "awts-commerce__empty";
	node.textContent = value;
	return node;
}
