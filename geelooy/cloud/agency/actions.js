//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module AgencyActions
 * @description Converts explicit Agency Control Center gestures into guarded Wallet
 * mutations. Form values identify intent; all prices and treasury balances remain server-owned.
 */

import {
	marketplaceAction,
	organizationAction,
	quoteResource,
	retryKey
} from "./data.js";
import { renderQuote, setStatus } from "./view.js";

export function bindAgencyActions(options) {
	const cleanups = [];
	cleanups.push(bindForm(options.createForm, values => mutateOrganization(options, {
		action: "create",
		name: values.name,
		idempotencyKey: retryKey("org-create")
	})));
	cleanups.push(bindForm(options.fundForm, values => mutateOrganization(options, {
		action: "fund",
		organizationId: values.organizationId,
		amountPerutahs: values.amountPerutahs,
		idempotencyKey: retryKey("org-fund")
	})));
	cleanups.push(bindForm(options.allocateForm, values => mutateOrganization(options, {
		action: "allocate",
		organizationId: values.organizationId,
		projectKey: values.projectKey,
		label: values.label,
		limitPerutahs: values.limitPerutahs,
		idempotencyKey: retryKey("org-budget")
	})));
	cleanups.push(bindForm(options.memberForm, values => mutateOrganization(options, {
		action: "member-set",
		organizationId: values.organizationId,
		alias: values.alias,
		role: values.role,
		idempotencyKey: retryKey("org-member")
	})));
	cleanups.push(bindForm(options.quoteForm, values => runQuote(options, values)));
	cleanups.push(bindForm(options.marketCreateForm, values => mutateMarketplace(options, {
		action: "create",
		title: values.title,
		description: values.description,
		kind: values.kind,
		pricePerutahs: values.pricePerutahs,
		deliveryRef: values.deliveryRef,
		idempotencyKey: retryKey("market-create")
	})));
	const marketplaceClick = event => buyMarketplace(options, event);
	options.marketplaceMount.addEventListener("click", marketplaceClick);
	cleanups.push(() => options.marketplaceMount.removeEventListener("click", marketplaceClick));
	return () => cleanups.forEach(cleanup => cleanup());
}

function bindForm(form, handler) {
	const listener = async event => {
		event.preventDefault();
		const values = Object.fromEntries(new FormData(form).entries());
		await handler(values);
	};
	form.addEventListener("submit", listener);
	return () => form.removeEventListener("submit", listener);
}
async function mutateOrganization(options, body) {
	setStatus(options.status, "Updating organization treasury…", "busy");
	const result = await organizationAction(body);
	await finishMutation(options, result, "Organization treasury updated.");
}

async function mutateMarketplace(options, body) {
	setStatus(options.status, "Updating marketplace…", "busy");
	const result = await marketplaceAction(body);
	await finishMutation(options, result, "Marketplace updated.");
}

async function buyMarketplace(options, event) {
	const button = event.target.closest("[data-marketplace-buy]");
	if (!button || button.disabled) return;
	button.disabled = true;
	const result = await marketplaceAction({
		action: "buy",
		listingId: button.dataset.marketplaceBuy,
		idempotencyKey: retryKey("market-buy")
	});
	await finishMutation(options, result, "Marketplace purchase recorded.");
}

async function runQuote(options, values) {
	setStatus(options.status, "Calculating from server-owned rates…", "busy");
	const result = await quoteResource(values);
	renderQuote(options.quoteMount, result);
	setStatus(options.status, result.ok ? "Live resource quote ready." : result.error, result.ok ? "success" : "error");
}

async function finishMutation(options, result, successText) {
	if (!result.ok) {
		setStatus(options.status, result.error || "Action could not be completed.", "error");
		return;
	}
	setStatus(options.status, successText, "success");
	await options.refresh();
}
