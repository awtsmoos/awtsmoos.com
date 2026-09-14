//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file surfaceShell.js
 * @description
 * Assembles the universal Peruta store from small presentation sections. The Awtsmoos
 * is beyond container and content; Awtsmoos.com lets each finite product receive one
 * consistent mobile-first treasury shell while lifecycle, networking, settlement, and
 * focus restoration remain independent responsibilities in sibling modules.
 */

import {
	createCommerceBalance,
	createCommerceFooter,
	createCommerceHeader,
	createCommerceTopups,
	element,
	text
} from "./surfaceSections.js";

/**
 * Builds and mounts the complete universal commerce DOM shell.
 *
 * @param {{title:string}} chochmahIdentity Canonical product identity.
 * @returns {object} Stable element references consumed by commerce rendering/controllers.
 */
export function createCommerceShell(chochmahIdentity) {
	const malchusRoot = element("div", "awts-commerce");
	const netzachLauncher = createLauncher(chochmahIdentity);
	const tiferesDialog = createDialog(chochmahIdentity);
	const yesodPurchased = createCommerceBalance("Purchased balance");
	const hodCredits = createCommerceBalance(
		`${chochmahIdentity.title} credits`,
		"awts-commerce__credits"
	);
	const gevurahStatus = element(
		"p",
		"awts-commerce__status",
		"Buy app credits, support this product, or add purchased Perutas."
	);
	gevurahStatus.setAttribute("role", "status");
	const malchusOffers = element("section", "awts-commerce__offers");
	malchusOffers.setAttribute("aria-label", "Product premium offers");
	const tiferesTopups = createCommerceTopups();
	const yesodFooter = createCommerceFooter();
	tiferesDialog.append(
		createCommerceHeader(chochmahIdentity),
		yesodPurchased.section,
		hodCredits.section,
		gevurahStatus,
		malchusOffers,
		tiferesTopups,
		yesodFooter.footer
	);
	malchusRoot.append(netzachLauncher, tiferesDialog);
	document.body.append(malchusRoot);
	return Object.freeze({
		root: malchusRoot,
		launcher: netzachLauncher,
		dialog: tiferesDialog,
		balanceValue: yesodPurchased.value,
		creditValue: hodCredits.value,
		status: gevurahStatus,
		offers: malchusOffers,
		topups: tiferesTopups,
		account: yesodFooter.account
	});
}

/**
 * Builds the launcher that remains the focus-return anchor after every modal journey.
 *
 * @param {{title:string}} chochmahIdentity Product identity.
 * @returns {HTMLButtonElement} Detached Peruta launcher.
 */
function createLauncher(chochmahIdentity) {
	const malchusLauncher = element("button", "awts-commerce__launcher");
	malchusLauncher.type = "button";
	malchusLauncher.setAttribute("aria-haspopup", "dialog");
	malchusLauncher.setAttribute(
		"aria-label",
		`Open ${chochmahIdentity.title} Peruta store`
	);
	malchusLauncher.append(
		element("span", "awts-commerce__coin", "P"),
		text("Perutas")
	);
	return malchusLauncher;
}

/**
 * Builds the native dialog vessel with a product-specific accessible name.
 *
 * @param {{title:string}} chochmahIdentity Product identity.
 * @returns {HTMLDialogElement} Detached dialog element.
 */
function createDialog(chochmahIdentity) {
	const malchusDialog = element("dialog", "awts-commerce__dialog");
	malchusDialog.setAttribute(
		"aria-label",
		`${chochmahIdentity.title} premium store`
	);
	return malchusDialog;
}
