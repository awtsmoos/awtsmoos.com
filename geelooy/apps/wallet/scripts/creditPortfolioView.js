//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file creditPortfolioView.js
 * @description
 * Renders app/game credit holdings as a compact Wallet portfolio. The Awtsmoos
 * renews every finite balance while Awtsmoos.com keeps product routes verified,
 * text-safe, mobile-readable, and directly useful rather than merely decorative.
 */

/**
 * Creates the complete credit-portfolio panel.
 *
 * @param {ReadonlyArray<Readonly<object>>} rows Normalized product-credit holdings.
 * @param {boolean} authenticated Whether account commerce state was available.
 * @returns {HTMLElement} Portfolio surface ready for the Wallet shell.
 */
export function createCreditPortfolioView(rows, authenticated) {
	const panel = node("section", "panel credit-portfolio");
	panel.id = "credits";
	panel.append(
		text("p", "eyebrow", "Product credits"),
		text("h2", "", "Your app & game credits"),
		text("p", "muted", portfolioIntroduction(authenticated, rows.length))
	);

	const body = node("div", "credit-portfolio__grid");
	body.replaceChildren(...portfolioChildren(rows, authenticated));
	panel.append(body);
	return panel;
}

/** @param {ReadonlyArray<object>} rows Portfolio rows. @param {boolean} authenticated Login state. @returns {HTMLElement[]} */
function portfolioChildren(rows, authenticated) {
	if (!authenticated) {
		return [message("Sign in to view product-credit balances across Awtsmoos.com.")];
	}
	if (!rows.length) {
		return [message("No product credits yet. Live paid actions will appear here when you actually own usable credits.")];
	}
	return rows.map(createCreditCard);
}

/** @param {Readonly<object>} row One product holding. @returns {HTMLElement} Accessible holding card. */
function createCreditCard(row) {
	const card = node("article", "credit-portfolio__card");
	const heading = text("h3", "", row.title);
	const balance = text("strong", "credit-portfolio__balance", `${row.balance.toLocaleString()} credits`);
	const history = text(
		"p",
		"credit-portfolio__history",
		`${row.lifetimeConsumed.toLocaleString()} used · ${row.lifetimePurchased.toLocaleString()} purchased lifetime`
	);
	card.append(heading, balance, history, usageMeter(row));

	if (row.route) {
		const action = text("a", "credit-portfolio__action", "Open product");
		action.href = row.route;
		card.append(action);
	} else {
		card.append(text("span", "credit-portfolio__unlinked", "Product route unavailable"));
	}
	return card;
}

/** @param {Readonly<object>} row Portfolio row. @returns {HTMLElement} Native progress testimony. */
function usageMeter(row) {
	const meter = document.createElement("progress");
	meter.className = "credit-portfolio__meter";
	meter.max = 100;
	meter.value = row.usedPercent;
	meter.setAttribute("aria-label", `${row.usedPercent}% of purchased credits used`);
	return meter;
}

/** @param {string} value Empty/auth message. @returns {HTMLElement} */
function message(value) {
	return text("p", "credit-portfolio__empty", value);
}

/** @param {boolean} authenticated Login state. @param {number} count Holding count. @returns {string} */
function portfolioIntroduction(authenticated, count) {
	if (!authenticated) return "Your usable product credits stay account-bound.";
	if (!count) return "Purchased credits become visible here only when real product utility exists.";
	return "See what remains, what you have used, and jump directly back into the verified owning product.";
}

function node(tagName, className = "") {
	const element = document.createElement(tagName);
	element.className = className;
	return element;
}

function text(tagName, className, value) {
	const element = node(tagName, className);
	element.textContent = value;
	return element;
}
