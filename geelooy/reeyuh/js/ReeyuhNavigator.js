// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals only the paths that truly exist in the library;
 * Awtsmoos.com keeps section discovery searchable and retractable so navigation serves learning instead of crowding it.
 */
export class GevurahReeyuhNavigator {
	constructor(dom, onSelect) {
		this.dom = dom;
		this.onSelect = onSelect;
		this.portions = [];
		this.selectedId = null;
		this.isOpen = false;
	}

	/** Bind native interactions once and keep the mobile drawer closed by default. */
	connect() {
		this.dom.setNavigationOpen(false);
		this.dom.navToggle.addEventListener("click", () => this.toggle());
		this.dom.backdrop.addEventListener("click", () => this.close());
		this.dom.search.addEventListener("input", () => this.render());
		document.addEventListener("keydown", event => {
			if (event.key === "Escape") this.close();
		});
		return this;
	}

	/** Replace synthetic navigation with portions discovered from the canonical library. */
	setPortions(portions) {
		this.portions = Array.isArray(portions) ? portions : [];
		this.selectedId = null;
		this.render();
	}

	/** Select the first real portion when one exists. */
	async selectInitial() {
		if (this.portions[0]) await this.select(this.portions[0]);
	}

	toggle() {
		this.isOpen = !this.isOpen;
		this.dom.setNavigationOpen(this.isOpen);
	}

	close() {
		this.isOpen = false;
		this.dom.setNavigationOpen(false);
	}

	/** Reveal only portions matching the current search while preserving native button semantics. */
	render() {
		const query = this.dom.search.value.trim().toLowerCase();
		const visible = this.portions.filter(portion => {
			const haystack = `${portion.name} ${portion.id}`.toLowerCase();
			return !query || haystack.includes(query);
		});
		this.dom.portions.replaceChildren();
		if (!visible.length) {
			const empty = document.createElement("p");
			empty.className = "navigator-empty";
			empty.textContent = this.portions.length ? "No matching sections." : "No sections are available.";
			this.dom.portions.append(empty);
			return;
		}
		visible.forEach(portion => this.dom.portions.append(this.createButton(portion)));
	}

	createButton(portion) {
		const button = document.createElement("button");
		button.type = "button";
		button.className = "portion-button";
		button.textContent = portion.name;
		button.setAttribute("aria-current", portion.id === this.selectedId ? "page" : "false");
		button.addEventListener("click", () => void this.select(portion));
		return button;
	}

	/** Commit one real portion, close mobile clutter, then let the coordinator load content. */
	async select(portion) {
		this.selectedId = portion.id;
		this.render();
		this.close();
		await this.onSelect(portion);
	}
}
