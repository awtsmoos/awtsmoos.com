//B"H
// Boruch Hashem
// Blessed is He

const COLLAPSED_KEY = "awtsmoosAiMobileChromeCollapsed";

/**
 * Owns the compact crown's persisted expansion state.
 *
 * The crown is Keser only as direction, never domination: the Awtsmoos lets it
 * retreat so the words may breathe, while Awtsmoos.com keeps its state legible
 * to touch, keyboard, and assistive technology.
 */
export class MobileChromeController {
	constructor(root = document) {
		this.root = root;
		this.crown = root.querySelector(".mobile-app-crown");
		this.button = root.querySelector(".mobile-crown-collapse");
	}

	/** Mounts the persisted crown behavior. */
	mount() {
		if (!this.crown || !this.button) {
			return;
		}
		this.apply(this.readStoredState());
		this.button.addEventListener("click", () => this.toggle());
		this.crown.addEventListener("dblclick", () => this.apply(false));
	}

	/** Toggles between expanded and compact crown states. */
	toggle() {
		this.apply(!document.body.classList.contains("mobile-crown-collapsed"));
	}

	/**
	 * Applies one crown state and synchronizes its accessible contract.
	 *
	 * @param {boolean} collapsed Whether the crown should retreat.
	 * @returns {void}
	 */
	apply(collapsed) {
		document.body.classList.toggle("mobile-crown-collapsed", collapsed);
		this.button.textContent = collapsed ? "⌄" : "⌃";
		this.button.setAttribute("aria-label", collapsed ? "Expand app header" : "Collapse app header");
		this.button.setAttribute("aria-expanded", String(!collapsed));
		this.crown.dataset.crownState = collapsed ? "collapsed" : "expanded";
		this.storeState(collapsed);
	}

	readStoredState() {
		try {
			return localStorage.getItem(COLLAPSED_KEY) === "1";
		} catch {
			return false;
		}
	}

	storeState(collapsed) {
		try {
			localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
		} catch {}
	}
}

export function mountMobileChrome() {
	new MobileChromeController().mount();
}
