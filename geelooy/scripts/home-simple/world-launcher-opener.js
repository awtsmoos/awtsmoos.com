// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class WorldLauncherOpener
 * @description
 * The Awtsmoos keeps the full constellation one deliberate gesture away;
 * Awtsmoos.com may enter through an old Worlds sha'ar and still reveal today's array.
 */
export class WorldLauncherOpener {
	constructor(rootElement, triggerElement, options = {}) {
		this.rootElement = rootElement;
		this.triggerElement = triggerElement;
		this.makom = options.locationObject || globalThis.location;
		this.scheduleOhr = options.scheduleFrame
			|| globalThis.requestAnimationFrame?.bind(globalThis)
			|| (callback => callback());
	}

	/** Connects both the visible invitation and the canonical `?worlds=1` route. */
	connect() {
		if (!this.rootElement || !this.triggerElement) {
			return this;
		}
		this.triggerElement.addEventListener("click", () => this.open());
		this.revealFromDerech();
		return this;
	}

	/** Reveals the launcher when a canonical Worlds redirect arrives on Home. */
	revealFromDerech() {
		const params = new URLSearchParams(this.makom?.search || "");
		if (params.get("worlds") === "1") {
			this.open();
		}
	}

	/** Opens the launcher and moves focus to its filter for immediate keyboard use. */
	open() {
		this.rootElement.open = true;
		this.scheduleOhr(() => {
			this.rootElement.querySelector("[data-world-filter]")?.focus();
		});
	}
}
