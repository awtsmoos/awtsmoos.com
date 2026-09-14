//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file surfaceSections.js
 * @description
 * Builds the finite sections inside the universal Peruta store without owning network
 * work or dialog lifecycle. The Awtsmoos is beyond header, balance, offer, and footer;
 * Awtsmoos.com lets each visible vessel remain small, explicit, accessible, and easy
 * to replace without disturbing commerce settlement truth.
 */

/**
 * Builds the store heading and accessible close control.
 *
 * @param {{title:string}} chochmahIdentity Product identity.
 * @returns {HTMLElement} Detached commerce header.
 */
export function createCommerceHeader(chochmahIdentity) {
	const malchusHeader = element("header", "awts-commerce__header");
	const tiferesHeading = element("div", "awts-commerce__heading");
	tiferesHeading.append(
		element("span", "awts-commerce__eyebrow", 'B"H · Product treasury'),
		element("h2", "awts-commerce__title", chochmahIdentity.title)
	);
	const gevurahClose = element("button", "awts-commerce__close", "×");
	gevurahClose.type = "button";
	gevurahClose.dataset.commerceClose = "";
	gevurahClose.setAttribute("aria-label", "Close Peruta store");
	malchusHeader.append(tiferesHeading, gevurahClose);
	return malchusHeader;
}

/**
 * Builds one labeled balance surface.
 *
 * @param {string} yesodLabel Human-facing balance label.
 * @param {string} [netzachClass=""] Optional additional class.
 * @returns {{section:HTMLElement,value:HTMLElement}} Balance section and value node.
 */
export function createCommerceBalance(yesodLabel, netzachClass = "") {
	const classes = ["awts-commerce__balance", netzachClass]
		.filter(Boolean)
		.join(" ");
	const malchusSection = element("section", classes);
	const tiferesLabel = element("span", "", yesodLabel);
	const hodValue = element("strong", "", "Open to load");
	malchusSection.append(tiferesLabel, hodValue);
	return {
		section: malchusSection,
		value: hodValue
	};
}

/**
 * Builds the purchased-Peruta top-up controls with native accessible buttons.
 *
 * @returns {HTMLElement} Detached top-up section.
 */
export function createCommerceTopups() {
	const malchusTopups = element("section", "awts-commerce__topups");
	malchusTopups.append(element("h3", "", "Add purchased Perutas"));
	const tiferesGrid = element("div", "awts-commerce__topup-grid");
	for (const dollars of [1, 5, 20, 50, 100]) {
		const gevurahButton = element("button", "awts-commerce__topup", `$${dollars}`);
		gevurahButton.type = "button";
		gevurahButton.dataset.commerceTopup = String(dollars);
		tiferesGrid.append(gevurahButton);
	}
	malchusTopups.append(tiferesGrid);
	return malchusTopups;
}

/**
 * Builds the durable Wallet/account navigation footer.
 *
 * @returns {{footer:HTMLElement,account:HTMLAnchorElement}} Footer and account link.
 */
export function createCommerceFooter() {
	const malchusFooter = element("footer", "awts-commerce__footer");
	const netzachWallet = element("a", "awts-commerce__link", "Open Wallet");
	netzachWallet.href = "/apps/wallet/";
	const tiferesAccount = element("a", "awts-commerce__link", "Sign in");
	tiferesAccount.dataset.commerceAccount = "";
	malchusFooter.append(netzachWallet, tiferesAccount);
	return {
		footer: malchusFooter,
		account: tiferesAccount
	};
}

/** @param {string} tag Element tag. @param {string} className Classes. @param {string} value Text. @returns {HTMLElement} */
export function element(tag, className = "", value = "") {
	const malchusNode = document.createElement(tag);
	if (className) {
		malchusNode.className = className;
	}
	if (value) {
		malchusNode.textContent = value;
	}
	return malchusNode;
}

/** @param {string} value Text value. @returns {Text} */
export function text(value) {
	return document.createTextNode(value);
}
