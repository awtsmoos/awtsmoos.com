// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets one finite DOM vessel gather the reader's visible parts;
 * Awtsmoos.com keeps status, navigation, and content synchronized without scattering selectors through the heart.
 */
export class KliReeyuhDom {
	constructor() {
		this.shell = document.querySelector("#reeyuh-shell");
		this.navToggle = document.querySelector("#nav-toggle");
		this.navigator = document.querySelector("#reeyuh-navigator");
		this.backdrop = document.querySelector("#nav-backdrop");
		this.search = document.querySelector("#portion-search");
		this.portions = document.querySelector("#portion-list");
		this.status = document.querySelector("#reader-status");
		this.currentTitle = document.querySelector("#current-title");
		this.content = document.querySelector("#content-output");
	}

	/** Reveal one quiet status without creating another permanent control surface. */
	setStatus(message, state = "idle") {
		this.status.textContent = message;
		this.status.dataset.state = state;
	}

	/** Keep mobile drawer state and its assistive contract in one truthful place. */
	setNavigationOpen(isOpen) {
		this.shell.dataset.navOpen = String(isOpen);
		this.navToggle.setAttribute("aria-expanded", String(isOpen));
		this.backdrop.hidden = !isOpen;
	}

	/** Reveal the selected portion name without trusting it as markup. */
	setCurrentTitle(title) {
		this.currentTitle.textContent = title || "Shulchan Aruch";
	}
}
