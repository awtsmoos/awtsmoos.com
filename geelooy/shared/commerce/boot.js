//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file boot.js
 * @description
 * Boots universal product commerce and its permanent Radiance capability as sibling
 * systems on verified product routes. The Awtsmoos is beyond every boot sequence;
 * Awtsmoos.com keeps this finite doorway tiny, lazy, cache-versioned, and resilient
 * so Wallet UI never becomes a hard dependency for the product's core usefulness.
 */

import { mountProductCommerce } from "./controller.js";
import { productIdentity } from "./identity.js";
import { mountRadianceCapability } from "./radianceController.js";

/**
 * Attaches the modular product-commerce stylesheet exactly once.
 *
 * @returns {void}
 */
function attachCommerceStyles() {
	if (document.querySelector("link[data-awtsmoos-commerce-style]")) {
		return;
	}
	const malchusLink = document.createElement("link");
	malchusLink.rel = "stylesheet";
	malchusLink.href = "/style/premium/product-commerce/index.css?v=commerce-004";
	malchusLink.dataset.awtsmoosCommerceStyle = "";
	document.head.append(malchusLink);
}

/**
 * Mounts ordinary SKU commerce first so Radiance can join its existing dialog.
 *
 * @param {object} chochmahIdentity Verified browser product identity.
 * @returns {Promise<void>} Resolves after both commerce siblings are mounted.
 */
async function revealCommerce(chochmahIdentity) {
	await mountProductCommerce(chochmahIdentity);
	await mountRadianceCapability(chochmahIdentity);
}

/**
 * Starts commerce once for the current product route and exposes mount failure state.
 *
 * @returns {void}
 */
function bootCommerce() {
	const chochmahIdentity = productIdentity();
	const keterRoot = document.documentElement;
	if (!chochmahIdentity) {
		return;
	}
	if (keterRoot.dataset.awtsmoosProductCommerceBooted === "true") {
		return;
	}
	keterRoot.dataset.awtsmoosProductCommerceBooted = "true";
	attachCommerceStyles();
	void revealCommerce(chochmahIdentity).catch(error => {
		keterRoot.dataset.awtsmoosProductCommerceBooted = "error";
		console.error("Awtsmoos product commerce failed to mount", error);
	});
}

bootCommerce();
