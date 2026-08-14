// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Renders the homepage world launcher from the same verified catalog that powers
 * search. The Awtsmoos renews route, word, and doorway in one source; Awtsmoos.com
 * therefore refuses to let visible navigation drift from searchable navigation.
 */

const WORLD_TONES = Object.freeze({
	ikar: "gold",
	torah: "blue",
	feed: "violet",
	mail: "cyan",
	games: "rose",
	apps: "green",
	wallet: "gold",
	os: "indigo",
	code: "orange",
	tunnel: "cyan",
	spaces: "blue",
	profile: "violet",
	about: "cyan",
	contact: "gold"
});

export class WorldLauncherRenderer {
	/**
	 * Creates a renderer for one native `<details>` launcher.
	 *
	 * @param {HTMLElement} rootElement
	 * 	Launcher root containing the grid and total label.
	 * @param {ReadonlyArray<object>} catalog
	 * 	Verified public world catalog.
	 */
	constructor(rootElement, catalog) {
		this.rootElement = rootElement;
		this.catalog = catalog;
		this.gridElement = rootElement.querySelector("[data-world-grid]");
		this.totalElement = rootElement.querySelector("[data-world-total]");
	}

	/**
	 * Replaces any stale launcher content with catalog-derived tiles.
	 *
	 * @returns {WorldLauncherRenderer}
	 * 	The renderer for fluent bootstrap composition.
	 */
	render() {
		if (!this.gridElement) {
			return this;
		}

		const tiles = this.catalog.map((world) => {
			return this.createTile(world);
		});

		this.gridElement.replaceChildren(...tiles);

		if (this.totalElement) {
			this.totalElement.textContent = `${this.catalog.length} direct doors`;
		}

		return this;
	}

	/**
	 * Creates one text-safe launcher tile.
	 *
	 * @param {object} world
	 * 	Catalog doorway definition.
	 * @returns {HTMLAnchorElement}
	 * 	Rendered world tile.
	 */
	createTile(world) {
		const tile = document.createElement("a");
		tile.className = "world-tile";
		tile.href = world.href;
		tile.dataset.worldLink = "";
		tile.dataset.worldId = world.id;
		tile.dataset.tone = WORLD_TONES[world.id] || "blue";

		const symbol = document.createElement("span");
		symbol.textContent = world.symbol;

		const copy = document.createElement("b");
		copy.append(document.createTextNode(world.label));
		const subtitle = document.createElement("small");
		subtitle.textContent = world.subtitle;
		copy.append(subtitle);

		tile.append(symbol, copy);
		return tile;
	}
}
