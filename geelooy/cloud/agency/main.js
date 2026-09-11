//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module AgencyMain
 * @description Boots the Awtsmoos Agency Control Center from live Wallet testimony,
 * renders server truth, and binds explicit operator gestures after DOM readiness.
 */

import { bindAgencyActions } from "./actions.js";
import { loadAgencyData } from "./data.js";
import { renderMarketplace, renderOrganizations, setStatus } from "./view.js";

const dom = {
	status: document.querySelector("#agencyStatus"),
	organizationMount: document.querySelector("#organizationGrid"),
	marketplaceMount: document.querySelector("#marketplaceGrid"),
	quoteMount: document.querySelector("#quoteResult"),
	createForm: document.querySelector("#createOrganizationForm"),
	fundForm: document.querySelector("#fundOrganizationForm"),
	allocateForm: document.querySelector("#allocateBudgetForm"),
	memberForm: document.querySelector("#memberForm"),
	quoteForm: document.querySelector("#quoteForm"),
	marketCreateForm: document.querySelector("#marketplaceCreateForm"),
	organizationSelects: [...document.querySelectorAll("[data-organization-select]")]
};

let authenticated = false;

async function refresh() {
	setStatus(dom.status, "Refreshing live Awtsmoos business testimony…", "busy");
	const data = await loadAgencyData();
	authenticated = data.balance?.ok === true;
	renderOrganizations(dom.organizationMount, dom.organizationSelects, data.organizations);
	renderMarketplace(dom.marketplaceMount, data.marketplace);
	applyAuthority();
	setStatus(
		dom.status,
		authenticated
			? "Live. Purchased Perutas, client budgets, marketplace, and resource quotes are ready."
			: "Marketplace and quotes are public. Sign in to operate organization treasury and purchases.",
		authenticated ? "success" : "neutral"
	);
}

function applyAuthority() {
	for (const form of [
		dom.createForm,
		dom.fundForm,
		dom.allocateForm,
		dom.memberForm,
		dom.marketCreateForm
	]) {
		for (const control of form.elements) {
			control.disabled = !authenticated;
		}
	}
	for (const button of dom.marketplaceMount.querySelectorAll("[data-marketplace-buy]")) {
		if (!button.textContent.includes("Owned")) {
			button.disabled = !authenticated;
		}
	}
}

bindAgencyActions({
	...dom,
	refresh
});

refresh().catch(error => {
	setStatus(
		dom.status,
		`Control Center could not load: ${error.message}`,
		"error"
	);
});
