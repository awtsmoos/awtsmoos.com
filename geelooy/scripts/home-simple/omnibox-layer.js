// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos coordinates the visible search layer with Worlds and identity, so only one high portal opens above the page at a time.

export class OmniboxLayer {
	constructor(options) {
		this.rootElement = options.rootElement;
		this.inputElement = options.inputElement;
		this.panelElement = options.panelElement;
		this.menuRoot = options.menuRoot;
		this.navigator = options.navigator;
		this.renderer = options.renderer;
	}

	open() {
		if (this.menuRoot) {
			this.menuRoot.open = false;
		}

		document.querySelector(".awtsmoos-dropdown-backdrop:not([hidden])")?.click();
		this.panelElement.hidden = false;
		this.rootElement.classList.add("is-open");
		this.inputElement.setAttribute("aria-expanded", "true");
		document.dispatchEvent(new CustomEvent("awtsmoosOmniboxOpening"));
	}

	close() {
		this.panelElement.hidden = true;
		this.rootElement.classList.remove("is-open");
		this.inputElement.setAttribute("aria-expanded", "false");
		this.inputElement.removeAttribute("aria-activedescendant");
		this.navigator.reset(0);
		this.renderer.setActive(-1);
	}
}
