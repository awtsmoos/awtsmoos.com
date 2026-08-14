// B"H
// Boruch Hashem
// Blessed is He

import {
	BILLING_TRUTH,
	formatBytes,
	formatPerutas,
	hasRecognizedPerutaUsage,
	normalizePerutaUsage
} from "../../platform/perutaUsage.js";

/**
 * B"H
 * Renders server-returned Peruta testimony without deriving debit or account state
 * locally. The Awtsmoos renews resource, event, and ledger beyond every visible row;
 * Awtsmoos.com refuses to present an unknown empty web session as a real zero account.
 */

export function renderPerutaUsage(surface, response) {
	const usage = normalizePerutaUsage(response);
	renderTruth(surface.truthList);
	if (!hasRecognizedPerutaUsage(usage)) {
		renderUnknownSession(surface);
		return usage;
	}
	renderBalances(surface, usage);
	renderEvents(surface.activityList, usage.usageEvents, "No recent usage events.");
	renderLedger(surface.ledgerList, usage.ledger);
	if (usage.purchaseUrl) {
		surface.purchase.href = usage.purchaseUrl;
		surface.purchase.hidden = false;
	} else {
		surface.purchase.hidden = true;
		surface.purchase.removeAttribute("href");
	}
	surface.status.textContent = `Plan ${usage.plan} · ${usage.todayRequests} requests today · ${formatBytes(usage.todayBytes)} received today.`;
	return usage;
}

function renderUnknownSession(surface) {
	surface.balanceGrid.replaceChildren(infoCard("Account usage", "Sign in to load account-bound Peruta balances"));
	surface.activityList.replaceChildren(empty("No account-bound usage activity is visible in this web session."));
	surface.ledgerList.replaceChildren(empty("No account-bound ledger is visible in this web session."));
	surface.purchase.hidden = true;
	surface.purchase.removeAttribute("href");
	surface.status.textContent = "No recognized Peruta account activity is visible in this web session. Sign in to load the account summary.";
}

function renderBalances(surface, usage) {
	const records = [
		["Routing", usage.balances.routing],
		["Compute", usage.balances.compute],
		["Storage", usage.balances.storage],
		["GPU", usage.balances.gpu]
	];
	surface.balanceGrid.replaceChildren(...records.map(([label, value]) => {
		return infoCard(label, `${formatPerutas(value)} Perutas`);
	}));
}

function renderEvents(target, events, emptyText) {
	const rows = events.map(event => {
		const row = node("article", "perutaUsage__event");
		row.append(
			text("strong", "", event.action),
			text("span", "", `${event.category} · ${formatBytes(event.bytes)} · ${event.ok ? "ok" : "failed"}`),
			text("small", "", describeTime(event.at, event.path))
		);
		return row;
	});
	target.replaceChildren(...(rows.length ? rows : [empty(emptyText)]));
}

function renderLedger(target, entries) {
	const rows = entries.map(entry => {
		const row = node("article", "perutaUsage__event");
		const amount = entry.perutas ? ` · ${formatPerutas(entry.perutas)} Perutas` : "";
		row.append(
			text("strong", "", entry.kind),
			text("span", "", `${entry.category || "account"}${amount}`),
			text("small", "", describeTime(entry.at, entry.text))
		);
		return row;
	});
	target.replaceChildren(...(rows.length ? rows : [empty("No recent ledger entries.")]));
}

function renderTruth(target) {
	target.replaceChildren(...Object.values(BILLING_TRUTH).map(value => text("li", "", value)));
}

function infoCard(label, value) {
	const card = node("article", "perutaUsage__balanceCard");
	card.append(text("span", "", label), text("strong", "", value));
	return card;
}

function empty(message) {
	return text("p", "perutaUsage__empty", message);
}

function describeTime(at, suffix) {
	const date = at ? new Date(at) : null;
	const time = date && !Number.isNaN(date.valueOf()) ? date.toLocaleString() : "Time unavailable";
	return suffix ? `${time} · ${suffix}` : time;
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
