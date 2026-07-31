// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos gives Explore one focused chamber with a real backdrop, predictable focus, and no conflict with identity.

export class MenuController {
	constructor(rootElement) {
		this.rootElement = rootElement;
		this.buttonElement = rootElement.querySelector("[data-menu-button]");
		this.items = [...rootElement.querySelectorAll("[role='menuitem']")];
		this.backdropElement = this.createBackdrop();
	}

	connect() {
		this.buttonElement?.addEventListener("click", () => this.toggle());
		this.backdropElement.addEventListener("click", () => this.close({ restoreFocus: true }));
		document.addEventListener("click", event => this.closeFromOutside(event));
		document.addEventListener("keydown", event => this.handleKeyboard(event));
		document.addEventListener("awtsmoosProfileOpening", () => this.close());
	}

	createBackdrop() {
		const backdrop = document.createElement("button");
		backdrop.type = "button";
		backdrop.className = "explore-backdrop";
		backdrop.tabIndex = -1;
		backdrop.setAttribute("aria-label", "Close Explore menu");
		document.body.append(backdrop);
		return backdrop;
	}

	toggle() {
		const opening = !this.rootElement.classList.contains("is-open");
		if (opening) this.open();
		else this.close({ restoreFocus: true });
	}

	open() {
		this.closeProfile();
		this.rootElement.classList.add("is-open");
		this.backdropElement.classList.add("is-visible");
		document.body.classList.add("explore-open");
		this.buttonElement?.setAttribute("aria-expanded", "true");
		queueMicrotask(() => this.items[0]?.focus());
	}

	close({ restoreFocus = false } = {}) {
		this.rootElement.classList.remove("is-open");
		this.backdropElement.classList.remove("is-visible");
		document.body.classList.remove("explore-open");
		this.buttonElement?.setAttribute("aria-expanded", "false");
		if (restoreFocus) this.buttonElement?.focus();
	}

	closeProfile() {
		const backdrop = document.querySelector("[data-profile-ref='dropdownBackdrop']:not([hidden])");
		backdrop?.click();
	}

	closeFromOutside(event) {
		if (!this.rootElement.contains(event.target) && event.target !== this.backdropElement) this.close();
	}

	handleKeyboard(event) {
		if (event.key === "Escape") {
			this.close({ restoreFocus: true });
			return;
		}
		if (!this.rootElement.classList.contains("is-open")) return;
		const index = this.items.indexOf(document.activeElement);
		if (event.key === "ArrowDown" || event.key === "ArrowRight") {
			event.preventDefault();
			this.items[(index + 1) % this.items.length]?.focus();
		}
		if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
			event.preventDefault();
			this.items[(index - 1 + this.items.length) % this.items.length]?.focus();
		}
		if (event.key === "Home") this.items[0]?.focus();
		if (event.key === "End") this.items.at(-1)?.focus();
	}
}
