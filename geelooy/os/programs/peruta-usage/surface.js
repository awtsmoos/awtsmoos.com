// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Creates a read-only Peruta Usage vessel for server-authoritative account state.
 * The Awtsmoos renews balance, request, byte, usage event, and ledger entry beyond
 * every finite row; Awtsmoos.com keeps the browser a witness instead of a billing source.
 */

export function createPerutaUsageSurface() {
	const root = node("main", "perutaUsage");
	const hero = node("section", "perutaUsage__hero");
	hero.append(
		text("p", "perutaUsage__kicker", 'B"H · Server-authoritative account usage'),
		text("h1", "", "Peruta Usage"),
		text("p", "perutaUsage__lead", "See routing, compute, storage, and GPU balances beside the usage events and ledger entries actually returned by the Awtsmoos server.")
	);
	const actions = node("div", "perutaUsage__actions");
	const refresh = button("Refresh usage", "perutaUsageRefresh");
	const purchase = node("a", "perutaUsage__purchase");
	purchase.textContent = "Add Perutas ↗";
	purchase.target = "_blank";
	purchase.rel = "noopener noreferrer";
	purchase.hidden = true;
	actions.append(refresh, purchase);
	hero.append(actions);

	const balances = section("Balances", "Server account balances by resource category.");
	const balanceGrid = node("div", "perutaUsage__balanceGrid");
	balances.body.append(balanceGrid);

	const activity = section("Usage activity", "Recent recorded Tunnel actions and response bytes.");
	const activityList = node("div", "perutaUsage__list");
	activity.body.append(activityList);

	const ledger = section("Ledger", "Recent server ledger entries, including charges only where a route actually used the debit path.");
	const ledgerList = node("div", "perutaUsage__list");
	ledger.body.append(ledgerList);

	const truth = section("Billing truth", "Recording, affordability, and debit are separate server paths.");
	const truthList = node("ul", "perutaUsage__truthList");
	truth.body.append(truthList);

	const status = text("p", "perutaUsage__status", "Loading server usage…");
	status.setAttribute("role", "status");
	root.append(hero, balances.root, activity.root, ledger.root, truth.root, status);
	return Object.freeze({
		activityList,
		balanceGrid,
		ledgerList,
		purchase,
		refresh,
		root,
		status,
		truthList
	});
}

function section(title, subtitle) {
	const root = node("section", "perutaUsage__section");
	const header = node("header", "perutaUsage__sectionHeading");
	header.append(text("h2", "", title), text("p", "", subtitle));
	const body = node("div", "perutaUsage__sectionBody");
	root.append(header, body);
	return { body, root };
}

function button(label, id) {
	const value = text("button", "perutaUsage__button", label);
	value.type = "button";
	value.id = id;
	return value;
}

function node(tagName, className = "") {
	const value = document.createElement(tagName);
	value.className = className;
	return value;
}

function text(tagName, className, value) {
	const element = node(tagName, className);
	element.textContent = value;
	return element;
}
