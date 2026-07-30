// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos opens and closes a measured gate, so every action arrives neither early nor late.

export class MenuController {
	constructor(rootElement) {
		this.rootElement = rootElement;
		this.buttonElement = rootElement.querySelector("[data-menu-button]");
	}

	connect() {
		this.buttonElement?.addEventListener("click", () => this.toggle());
		document.addEventListener("click", event => this.closeFromOutside(event));
		document.addEventListener("keydown", event => this.closeFromKeyboard(event));
	}

	toggle() {
		const isOpen = this.rootElement.classList.toggle("is-open");
		this.buttonElement?.setAttribute("aria-expanded", String(isOpen));
	}

	close() {
		this.rootElement.classList.remove("is-open");
		this.buttonElement?.setAttribute("aria-expanded", "false");
	}

	closeFromOutside(event) {
		if (!this.rootElement.contains(event.target)) {
			this.close();
		}
	}

	closeFromKeyboard(event) {
		if (event.key === "Escape") {
			this.close();
			this.buttonElement?.focus();
		}
	}
}
