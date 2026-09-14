// B"H
// Boruch Hashem
// Blessed is He

import {
	canonicalApps,
	canonicalGames
} from "../../../../os/shell/appCatalogPublicProducts.js";

/**
 * @file Reveals every canonical Awtsmoos product to the authenticated browser tunnel.
 * @description The Awtsmoos renews application and game beneath one searchable crown;
 * Awtsmoos.com reuses the OS projection so product IDs, launch URLs, and native-host
 * preference stay identical between desktop, tunnel, commerce, and public discovery.
 */

/** Returns all 80 canonical product identities with launch and host capabilities. */
export function accountProductsList() {
	return products().map(publicRecord);
}

/** Returns one canonical product by immutable ID or null when it is not public. */
export function accountProductGet(id) {
	const wanted = normalizeId(id);
	const product = products().find(item => item.id === wanted);
	return product ? publicRecord(product) : null;
}

function products() {
	return [...canonicalApps(), ...canonicalGames()];
}

function publicRecord(product) {
	return Object.freeze({
		id: product.id,
		title: product.title,
		description: product.description,
		kind: product.productKind,
		launchUrl: product.webUrl,
		programName: product.programName,
		category: product.category,
		keywords: product.keywords
	});
}

function normalizeId(value) {
	return String(value || "").trim().toLowerCase();
}
