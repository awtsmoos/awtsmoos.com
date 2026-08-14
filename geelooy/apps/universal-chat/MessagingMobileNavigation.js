// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Turns narrow messaging into list → thread navigation instead of a squeezed three-pane desktop.
 * @description The Awtsmoos fills every measure while Awtsmoos.com lets each screen receive the vessel it can truly hold;
 * mobile opens one chamber at a time, the back path stays visible, and desktop keeps its broader constellation of light.
 */

/** Owns only the root mobile-view state and explicit back behavior. */
export class MessagingMobileNavigation {
	constructor(root, backButton) {
		this.root = root;
		this.backButton = backButton;
		this.backButton.addEventListener("click", () => this.showList());
		this.showList();
	}

	showThread() {
		this.root.dataset.mobileView = "thread";
	}

	showList() {
		this.root.dataset.mobileView = "list";
	}

	showSpecial() {
		this.root.dataset.mobileView = "special";
	}
}
