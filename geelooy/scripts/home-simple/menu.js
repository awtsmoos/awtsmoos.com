// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos gathers every world without trapping the traveler; native details remain the vessel, and this class adds graceful light.

export class MenuController {
	constructor(rootElement) {
		this.rootElement = rootElement;
		this.buttonElement = rootElement.querySelector("[data-menu-button]");
		this.panelElement = rootElement.querySelector("[data-menu-panel]");
		this.backdropElement = document.querySelector("[data-menu-backdrop]");
		this.linkElements = [...rootElement.querySelectorAll("[data-world-link]")];
	}

	connect() {
		this.rootElement.addEventListener("toggle", () => this.syncState());
		this.backdropElement?.addEventListener("click", () => this.close(true));
		document.addEventListener("pointerdown", event => this.handleOutsidePointer(event));
		document.addEventListener("keydown", event => this.handleKeyboard(event));
		document.addEventListener("awtsmoosProfileOpening", () => this.close(false));
		this.syncState();
		return this;
	}

	syncState() {
		const isOpen = this.rootElement.open;
		this.buttonElement?.setAttribute("aria-expanded", String(isOpen));
		this.panelElement?.setAttribute("aria-hidden", String(!isOpen));
		this.backdropElement?.setAttribute("aria-hidden", String(!isOpen));
		this.backdropElement?.toggleAttribute("disabled", !isOpen);
		this.backdropElement?.classList.toggle("is-visible", isOpen);
		document.body.classList.toggle("explore-open", isOpen);

		if (isOpen) {
			this.closeProfileDropdown();
			document.dispatchEvent(new CustomEvent("awtsmoosExploreOpening"));
		}
	}

	close(restoreFocus = false) {
		if (!this.rootElement.open) {
			return;
		}

		this.rootElement.open = false;

		if (restoreFocus) {
			this.buttonElement?.focus();
		}
	}

	handleOutsidePointer(event) {
		if (!this.rootElement.open || this.rootElement.contains(event.target)) {
			return;
		}

		if (event.target !== this.backdropElement) {
			this.close(false);
		}
	}

	handleKeyboard(event) {
		if (event.key === "Escape" && this.rootElement.open) {
			event.preventDefault();
			this.close(true);
			return;
		}

		if (!this.rootElement.open) {
			return;
		}

		const navigableLinks = this.getNavigableLinks();

		if (event.target === this.buttonElement && event.key === "ArrowDown") {
			event.preventDefault();
			navigableLinks[0]?.focus();
			return;
		}

		const activeIndex = navigableLinks.indexOf(document.activeElement);
		const direction = this.getDirection(event.key);

		if (activeIndex < 0 || direction === null || navigableLinks.length === 0) {
			return;
		}

		event.preventDefault();
		const nextIndex = (activeIndex + direction + navigableLinks.length) % navigableLinks.length;
		navigableLinks[nextIndex]?.focus();
	}

	getNavigableLinks() {
		return this.linkElements.filter(linkElement => {
			return !linkElement.hidden && linkElement.getAttribute("aria-hidden") !== "true";
		});
	}

	getDirection(keyName) {
		const panelWidth = this.panelElement?.getBoundingClientRect().width ?? window.innerWidth;
		const columnCount = panelWidth < 620 ? 2 : panelWidth < 900 ? 3 : 4;
		const directions = {
			ArrowLeft: -1,
			ArrowRight: 1,
			ArrowUp: -columnCount,
			ArrowDown: columnCount
		};
		return directions[keyName] ?? null;
	}

	closeProfileDropdown() {
		const profileBackdrop = document.querySelector(".awtsmoos-dropdown-backdrop:not([hidden])");
		profileBackdrop?.click();
	}
}
