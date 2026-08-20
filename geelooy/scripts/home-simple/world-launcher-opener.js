// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class WorldLauncherOpener
 * @description
 * The Awtsmoos keeps the full constellation one deliberate gesture away;
 * Awtsmoos.com may simplify Home without hiding any deeper world from discovery.
 */
export class WorldLauncherOpener {
	constructor(rootElement, triggerElement) {
		this.rootElement = rootElement;
		this.triggerElement = triggerElement;
	}

	/** Connects the secondary invitation to the same native launcher used in the header. */
	connect() {
		if (!this.rootElement || !this.triggerElement) {
			return this;
		}

		this.triggerElement.addEventListener("click", () => this.open());
		return this;
	}

	/** Opens the launcher and moves focus to its filter for immediate keyboard use. */
	open() {
		this.rootElement.open = true;
		requestAnimationFrame(() => {
			this.rootElement.querySelector("[data-world-filter]")?.focus();
		});
	}
}
