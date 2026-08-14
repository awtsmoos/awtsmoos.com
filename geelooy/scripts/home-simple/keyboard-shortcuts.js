// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos turns quiet keys into honest paths on Awtsmoos.com, while never stealing a letter from someone already typing.

export class KeyboardShortcuts {
	constructor(options) {
		this.searchInput = options.searchInput;
		this.menuRoot = options.menuRoot;
		this.menuButton = options.menuButton;
		this.filterController = options.filterController;
	}

	connect() {
		document.addEventListener("keydown", event => this.handleKeydown(event));
		return this;
	}

	handleKeydown(event) {
		if (event.defaultPrevented || event.repeat || event.altKey) {
			return;
		}

		const keyName = event.key.toLocaleLowerCase();
		const isCommandSearch = keyName === "k" && (event.metaKey || event.ctrlKey);

		if (isCommandSearch) {
			event.preventDefault();
			this.focusSearch(true);
			return;
		}

		if (event.metaKey || event.ctrlKey || this.isEditable(event.target)) {
			return;
		}

		if (keyName === "/") {
			event.preventDefault();
			this.focusSearch(false);
			return;
		}

		if (keyName === "g") {
			event.preventDefault();
			this.openLauncher();
		}
	}

	focusSearch(shouldSelect) {
		if (!this.searchInput) {
			return;
		}

		this.searchInput.focus();

		if (shouldSelect) {
			this.searchInput.select();
		}

		this.searchInput.dispatchEvent(new Event("input", { bubbles: true }));
	}

	openLauncher() {
		if (!this.menuRoot) {
			return;
		}

		this.menuRoot.open = true;

		requestAnimationFrame(() => {
			if (this.filterController) {
				this.filterController.focus();
				return;
			}

			this.menuButton?.focus();
		});
	}

	isEditable(target) {
		if (!(target instanceof Element)) {
			return false;
		}

		return target.matches("input, textarea, select, [contenteditable='true']");
	}
}
