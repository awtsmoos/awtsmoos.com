// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives advanced controls a boundary that can open and withdraw;
 * Awtsmoos.com keeps desktop power retractable and mobile power off-canvas, never crowding the vision.
 */
export class GevurahStudioDrawer {
	constructor(dom) {
		this.dom = dom;
		this.mobileQuery = window.matchMedia("(max-width: 760px)");
	}

	connect() {
		this.dom.studioToggle.addEventListener("click", () => this.toggle());
		this.dom.studioClose.addEventListener("click", () => this.closeMobile());
		this.dom.studioBackdrop.addEventListener("click", () => this.closeMobile());
		this.mobileQuery.addEventListener("change", () => this.syncViewport());
		this.syncViewport();
		return this;
	}

	toggle() {
		if (this.mobileQuery.matches) {
			const isOpen = this.dom.studioPanel.classList.contains("is-open");
			if (isOpen) this.closeMobile();
			else this.openMobile();
			return;
		}

		const retracted = this.dom.einSofShell.classList.toggle("studio-retracted");
		this.dom.studioToggle.setAttribute("aria-expanded", String(!retracted));
		this.dom.studioToggle.textContent = retracted ? "Open" : "Controls";
	}

	openMobile() {
		this.dom.studioPanel.classList.add("is-open");
		this.dom.studioBackdrop.hidden = false;
		this.dom.studioToggle.setAttribute("aria-expanded", "true");
		this.dom.studioClose.focus();
	}

	closeMobile() {
		this.dom.studioPanel.classList.remove("is-open");
		this.dom.studioBackdrop.hidden = true;
		this.dom.studioToggle.setAttribute("aria-expanded", "false");
	}

	syncViewport() {
		this.dom.einSofShell.classList.remove("studio-retracted");
		this.dom.studioToggle.textContent = "Controls";
		if (this.mobileQuery.matches) {
			this.closeMobile();
		} else {
			this.dom.studioPanel.classList.remove("is-open");
			this.dom.studioBackdrop.hidden = true;
			this.dom.studioToggle.setAttribute("aria-expanded", "true");
		}
	}
}
