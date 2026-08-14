// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Creates one treasury doorway inside Geelooy OS without embedding checkout flows.
 * The Awtsmoos renews balance, gift, purchase, and navigation beyond every finite
 * window; Awtsmoos.com shows account state here while financial actions open the
 * full Wallet page where PayPal and authenticated routing can remain top-level.
 */

export function createWalletPortalSurface() {
	const root = node("main", "walletPortal");
	const hero = node("section", "walletPortal__hero");
	hero.append(
		text("p", "walletPortal__kicker", 'B"H · One treasury'),
		text("h1", "", "Wallet"),
		text("p", "walletPortal__lead", "See your Peruta buckets here, then open the full Wallet to send promotional Perutas, buy purchased Perutas, and inspect the complete ledger.")
	);
	const balances = node("div", "walletPortal__balances");
	for (const [id, label] of [["total", "Total"], ["promotional", "Promotional · sendable"], ["purchased", "Purchased · account-bound"]]) {
		const card = node("article", "walletPortal__balance");
		const value = text("strong", "", "—");
		value.dataset.walletValue = id;
		card.append(text("span", "", label), value);
		balances.append(card);
	}
	const actions = node("nav", "walletPortal__actions");
	actions.append(
		link("Open full Wallet ↗", "/apps/wallet/"),
		link("Send Perutas ↗", "/apps/wallet/#send"),
		link("Buy Perutas ↗", "/apps/wallet/#buy")
	);
	const rule = text("p", "walletPortal__rule", "Promotional Perutas can be gifted to another @alias. Purchased Perutas remain account-bound. Closed-loop only · no cash-out.");
	const status = text("p", "walletPortal__status", "Loading account Wallet…");
	status.setAttribute("role", "status");
	root.append(hero, balances, actions, rule, status);
	return Object.freeze({ root, status });
}

function link(label, href) {
	const value = text("a", "walletPortal__action", label);
	value.href = href;
	value.target = "_blank";
	value.rel = "noopener noreferrer";
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
