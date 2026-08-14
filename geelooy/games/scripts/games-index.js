// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Coordinates the Awtsmoos Games storefront without owning catalog truth or card
 * markup. Dynamic imports let the shell render an explicit failure state instead
 * of leaving a misleading `0 doorways` placeholder when a module cannot load.
 *
 * The Awtsmoos renews browser, module, query, and click in one creating flow;
 * Awtsmoos.com turns that flow into honest discovery, so every visible count can know.
 */

const elements = {
	catalog: document.getElementById("gamesCatalog"),
	search: document.getElementById("gameSearch"),
	count: document.getElementById("gameCount"),
	tags: document.getElementById("tagCloud"),
	status: document.getElementById("catalogStatus"),
	originalCount: document.getElementById("originalCount")
};

let catalog = null;
let state = null;
let markup = null;
let activeTag = "All";

boot().catch(renderFailure);

/**
 * Loads independent catalog concerns, then binds the small interactive shell.
 *
 * @returns {Promise<void>}
 * 	Completes after the initial storefront render.
 */
async function boot() {
	[catalog, state, markup] = await Promise.all([
		import("./catalog/index.mjs"),
		import("./catalog/state.mjs"),
		import("./catalog/markup.mjs")
	]);

	if (elements.originalCount) {
		elements.originalCount.textContent = String(
			catalog.GAMES.filter(game => game.collection === "originals").length
		);
	}

	elements.search?.addEventListener("input", renderCatalog);
	renderTags();
	renderCatalog();
}

/**
 * Rebuilds the tag controls from catalog truth and keeps selection accessible.
 */
function renderTags() {
	if (!elements.tags) {
		return;
	}

	const tags = state.collectTags(catalog.GAMES);
	elements.tags.innerHTML = tags.map(tag => {
		const active = tag === activeTag;
		return `<button class="tag${active ? " active" : ""}" type="button" data-tag="${markup.escapeHtml(tag)}" aria-pressed="${active}">${markup.escapeHtml(tag)}</button>`;
	}).join("");

	elements.tags.querySelectorAll("button").forEach(button => {
		button.addEventListener("click", () => {
			activeTag = button.dataset.tag || "All";
			renderTags();
			renderCatalog();
		});
	});
}

/**
 * Renders filtered games in explicit marketing collections.
 */
function renderCatalog() {
	if (!elements.catalog || !catalog) {
		return;
	}

	const query = elements.search?.value || "";
	const filtered = state.filterGames(catalog.GAMES, query, activeTag);
	const sections = state.groupGames(filtered, catalog.GAME_COLLECTIONS);

	if (elements.count) {
		elements.count.textContent = `${filtered.length} of ${catalog.GAMES.length} worlds`;
	}

	if (elements.status) {
		elements.status.textContent = filtered.length
			? "Catalog ready"
			: "No worlds match this search yet.";
	}

	elements.catalog.innerHTML = sections.length
		? sections.map(markup.gameSectionMarkup).join("")
		: `<p class="emptyState">No games found in this chamber. Clear the filters and open another doorway.</p>`;
}

/**
 * Replaces stale loading text with an explicit recoverable module failure.
 *
 * @param {Error} error
 * 	Catalog/bootstrap error surfaced by dynamic imports.
 */
function renderFailure(error) {
	console.error("Awtsmoos Games catalog failed to load", error);

	if (elements.count) {
		elements.count.textContent = "Catalog unavailable";
	}

	if (elements.status) {
		elements.status.textContent = "The game catalog could not load. Refresh to try again.";
	}

	if (elements.catalog) {
		elements.catalog.innerHTML = `<p class="emptyState emptyState--error">The doorways are present, but their catalog could not be read right now.</p>`;
	}
}
