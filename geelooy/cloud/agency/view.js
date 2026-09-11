//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module AgencyView
 * @description Renders organization, project-budget, quote, and marketplace
 * testimony with DOM text nodes so server data never becomes executable markup.
 */

export function renderOrganizations(mount, selects, response = {}) {
	const organizations = Array.isArray(response.organizations)
		? response.organizations
		: [];
	mount.replaceChildren(...organizations.map(organizationCard));
	for (const select of selects) {
		select.replaceChildren(...organizations.map(organizationOption));
		select.disabled = organizations.length === 0;
	}
	if (!organizations.length) {
		mount.replaceChildren(emptyCard("Create your first organization to begin."));
	}
}

export function renderMarketplace(mount, response = {}) {
	const listings = Array.isArray(response.listings) ? response.listings : [];
	mount.replaceChildren(...listings.map(marketplaceCard));
	if (!listings.length) {
		mount.replaceChildren(emptyCard("The marketplace is ready for its first reusable system."));
	}
}
function organizationCard(organization) {
	const article = element("article", "organization-card");
	article.append(
		element("p", "card-kicker", organization.role || "member"),
		element("h3", "", organization.name),
		element("strong", "balance", `${formatPerutas(organization.purchasedBalance)} Perutas`),
		element("p", "muted", `${organization.memberCount || 0} team members`)
	);
	const budgets = element("div", "budget-list");
	for (const budget of organization.budgets || []) {
		budgets.append(budgetRow(budget));
	}
	if (!(organization.budgets || []).length) {
		budgets.append(element("p", "muted", "No client budgets yet."));
	}
	article.append(budgets);
	return article;
}

function budgetRow(budget) {
	const row = element("div", "budget-row");
	row.append(
		element("span", "", budget.label || budget.key),
		element("b", "", `${formatPerutas(budget.availablePerutahs)} available`),
		element("small", "", `${formatPerutas(budget.spentPerutahs)} used / ${formatPerutas(budget.limitPerutahs)} limit`)
	);
	return row;
}

function marketplaceCard(listing) {
	const article = element("article", "market-card");
	article.append(
		element("p", "card-kicker", listing.kind || "blueprint"),
		element("h3", "", listing.title),
		element("p", "muted", listing.description),
		element("strong", "balance", `${formatPerutas(listing.pricePerutahs)} Perutas`)
	);
	const button = element("button", "market-buy", listing.ownedByViewer ? "Owned" : "Buy with Perutas");
	button.type = "button";
	button.disabled = Boolean(listing.ownedByViewer);
	button.dataset.marketplaceBuy = listing.id;
	article.append(button);
	return article;
}
export function renderQuote(mount, quote = {}) {
	if (!quote.ok) {
		mount.textContent = quote.error || "Quote unavailable.";
		return;
	}
	mount.textContent = quote.totalPerutahs === 0
		? `${quote.label}: 0 Perutas on your Tunnel.`
		: `${quote.label}: ${formatPerutas(quote.totalPerutahs)} Perutas for ${quote.units} units.`;
}

export function setStatus(mount, text, state = "") {
	mount.textContent = text;
	mount.dataset.state = state;
}

export function formatPerutas(value) {
	return Math.max(0, Number(value) || 0).toLocaleString("en-US");
}

function organizationOption(organization) {
	const option = document.createElement("option");
	option.value = organization.id;
	option.textContent = organization.name;
	return option;
}

function emptyCard(text) {
	return element("article", "empty-card", text);
}

function element(tag, className = "", text = "") {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text !== undefined && text !== null) node.textContent = String(text);
	return node;
}
