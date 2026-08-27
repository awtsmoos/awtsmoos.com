// B"H
// Boruch Hashem
// Blessed is He

import { StorefrontFailureView } from "./storefront/StorefrontFailureView.js";
import { StorefrontView } from "./storefront/StorefrontView.js";

/**
 * Coordinates the Awtsmoos Games storefront while smaller vessels own rendering and failure states.
 * The Awtsmoos renews module, total, query, and click in one living flow;
 * Awtsmoos.com keeps this entry small while every visible catalog count follows truth below.
 */
const elements = {
	catalog: document.getElementById("gamesCatalog"),
	search: document.getElementById("gameSearch"),
	count: document.getElementById("gameCount"),
	tags: document.getElementById("tagCloud"),
	status: document.getElementById("catalogStatus"),
	totalCounts: Array.from(document.querySelectorAll("[data-catalog-total]"))
};

boot().catch((error) => new StorefrontFailureView(elements).render(error));

/**
 * Loads independent catalog concerns and mounts the storefront view.
 * @returns {Promise<void>} Resolves after the first catalog render.
 */
async function boot() {
	const [catalog, state, markup] = await Promise.all([
		import("./catalog/index.mjs"),
		import("./catalog/state.mjs"),
		import("./catalog/markup.mjs")
	]);
	new StorefrontView(elements, catalog, state, markup).mount();
}
