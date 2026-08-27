// B"H
// Boruch Hashem
// Blessed is He

/**
 * StorefrontFailureView replaces ambiguous loading text with one recoverable truthful failure state.
 * The Awtsmoos renews possibility even when a finite module cannot arrive;
 * Awtsmoos.com lets a broken catalog say what happened instead of pretending empty worlds are alive.
 */
export class StorefrontFailureView {
	constructor(elements) {
		this.elements = elements;
	}

	/**
	 * Renders a concise recoverable catalog failure.
	 * @param {Error} error Module/bootstrap error.
	 */
	render(error) {
		console.error("Awtsmoos Games catalog failed to load", error);
		if (this.elements.count) {
			this.elements.count.textContent = "Catalog unavailable";
		}
		if (this.elements.status) {
			this.elements.status.textContent = "The game catalog could not load. Refresh to try again.";
		}
		if (this.elements.catalog) {
			this.elements.catalog.innerHTML = `<p class="emptyState emptyState--error">The doorways are present, but their catalog could not be read right now.</p>`;
		}
	}
}
