// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives expansion and contraction one measured boundary;
 * Awtsmoos.com lets panels open, minimize, and withdraw without stealing the workspace.
 */
export class GevurahPanelController {
	constructor(dom) {
		this.dom = dom;
		this.mobileQuery = window.matchMedia("(max-width: 760px)");
		this.bind();
		this.syncViewport();
	}

	bind() {
		this.dom.mobileBinBtn.addEventListener("click", () => this.openMobileBin());
		this.dom.mediaBackdrop.addEventListener("click", () => this.closeMobileBin());
		this.dom.toggleBin.addEventListener("click", () => this.toggleBin());
		this.dom.minimizeBin.addEventListener("click", () => this.minimizeBin());
		this.dom.toggleTimeline.addEventListener("click", () => this.toggleTimeline());
		this.dom.minimizeTimeline.addEventListener("click", () => this.minimizeTimeline());
		this.mobileQuery.addEventListener("change", () => this.syncViewport());
	}

	openMobileBin() {
		this.dom.binContainer.classList.add("is-open");
		this.dom.mediaBackdrop.hidden = false;
		this.dom.mobileBinBtn.setAttribute("aria-expanded", "true");
	}

	closeMobileBin() {
		this.dom.binContainer.classList.remove("is-open");
		this.dom.mediaBackdrop.hidden = true;
		this.dom.mobileBinBtn.setAttribute("aria-expanded", "false");
	}

	toggleBin() {
		if (this.mobileQuery.matches) {
			this.closeMobileBin();
			return;
		}
		const retracted = this.dom.binContainer.classList.toggle("is-retracted");
		this.dom.editorShell.classList.toggle("media-retracted", retracted);
		if (retracted) {
			this.dom.binContainer.classList.remove("is-minimized");
			this.dom.editorShell.classList.remove("media-minimized");
		}
	}

	minimizeBin() {
		if (this.mobileQuery.matches) {
			this.closeMobileBin();
			return;
		}
		const minimized = this.dom.binContainer.classList.toggle("is-minimized");
		this.dom.editorShell.classList.toggle("media-minimized", minimized);
	}

	toggleTimeline() {
		const retracted = this.dom.timelineWrapper.classList.toggle("is-retracted");
		this.dom.editorShell.classList.toggle("timeline-retracted", retracted);
		if (retracted) {
			this.dom.timelineWrapper.classList.remove("is-minimized");
			this.dom.editorShell.classList.remove("timeline-minimized");
		}
	}

	minimizeTimeline() {
		const minimized = this.dom.timelineWrapper.classList.toggle("is-minimized");
		this.dom.editorShell.classList.toggle("timeline-minimized", minimized);
	}

	syncViewport() {
		if (this.mobileQuery.matches) {
			this.dom.binContainer.classList.remove("is-retracted", "is-minimized");
			this.dom.editorShell.classList.remove("media-retracted", "media-minimized");
			this.closeMobileBin();
		} else {
			this.closeMobileBin();
		}
	}
}
