//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BuilderCommerceBridge
 * @description Opens the universal Drive store without duplicating Wallet or payment logic.
 */

export function openBuilderCommerce() {
	const launcher = document.querySelector(".awts-commerce__launcher");
	if (launcher instanceof HTMLElement) {
		launcher.click();
		return;
	}
	const url = new URL(window.location.href);
	url.searchParams.set("commerce", "1");
	window.location.assign(`${url.pathname}${url.search}${url.hash}`);
}
