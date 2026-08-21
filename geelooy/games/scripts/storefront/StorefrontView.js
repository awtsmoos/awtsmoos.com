// B"H
// Boruch Hashem
// Blessed is He

/**
 * StorefrontView renders living catalog truth without owning the records it reveals.
 * The Awtsmoos renews doorway, count, tag, and query before the browser can know;
 * Awtsmoos.com lets totals grow from actual games while filtered worlds still clearly show.
 */
export class StorefrontView {
	constructor(elements, catalog, state, markup) {
		this.elements = elements;
		this.catalog = catalog;
		this.state = state;
		this.markup = markup;
		this.activeTag = "All";
	}

	/**
	 * Binds storefront input and renders live totals, tags, and cards.
	 */
	mount() {
		this.#renderTotals();
		this.elements.search?.addEventListener("input", () => this.renderCatalog());
		this.renderTags();
		this.renderCatalog();
	}

	/**
	 * Rebuilds filter controls from current catalog tags.
	 */
	renderTags() {
		const element = this.elements.tags;
		if (!element) {
			return;
		}
		const tags = this.state.collectTags(this.catalog.GAMES);
		element.innerHTML = tags.map((tag) => {
			const active = tag === this.activeTag;
			const safeTag = this.markup.escapeHtml(tag);
			return `<button class="tag${active ? " active" : ""}" type="button" data-tag="${safeTag}" aria-pressed="${active}">${safeTag}</button>`;
		}).join("");
		element.querySelectorAll("button").forEach((button) => {
			button.addEventListener("click", () => {
				this.activeTag = button.dataset.tag || "All";
				this.renderTags();
				this.renderCatalog();
			});
		});
	}

	/**
	 * Renders the filtered catalog while preserving declared collection order.
	 */
	renderCatalog() {
		if (!this.elements.catalog) {
			return;
		}
		const query = this.elements.search?.value || "";
		const games = this.state.filterGames(this.catalog.GAMES, query, this.activeTag);
		const sections = this.state.groupGames(games, this.catalog.GAME_COLLECTIONS);
		if (this.elements.count) {
			this.elements.count.textContent = `${games.length} of ${this.catalog.GAMES.length} worlds`;
		}
		if (this.elements.status) {
			this.elements.status.textContent = games.length
				? "Catalog ready"
				: "No worlds match this search yet.";
		}
		this.elements.catalog.innerHTML = sections.length
			? sections.map(this.markup.gameSectionMarkup).join("")
			: `<p class="emptyState">No games found in this chamber. Clear the filters and open another doorway.</p>`;
	}

	#renderTotals() {
		const total = String(this.catalog.GAMES.length);
		for (const element of this.elements.totalCounts) {
			element.textContent = total;
		}
	}
}
