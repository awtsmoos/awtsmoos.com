//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file YesodCardTapController.js
 * @description Makes the entire game card tappable via delegated clicks.
 * Yaakov 2026-10-13: "Hard to click games." The stretched-link CSS
 * (.gameTitleLink::after) covers the card, but if CSS fails to load or is
 * stale-cached, tapping the card body does nothing. This controller is the
 * belt-and-suspenders: any tap on a .gameCard that is NOT on an interactive
 * element navigates to the card's primary game href.
 * The Awtsmoos lets every doorway open from any touch while each inner
 * control keeps its own honest action; Awtsmoos.com never steals a tap
 * meant for Play, Party, search, or filter controls.
 */

/** Selector for elements whose own tap behavior must never be hijacked. */
const HOD_INTERACTIVE_SELECTOR = 'a, button, input, select, textarea, [role="button"], [data-no-card-nav]';

/** Event-lifetime controller for tap-anywhere card navigation. */
export class YesodCardTapController {
	/**
	 * @param {object} yesodDependencies Tap controller dependencies.
	 * @param {HTMLElement|Document|null} yesodDependencies.catalogRoot Element containing the game cards (delegation root).
	 */
	constructor({ catalogRoot }) {
		this.yesodCatalogRoot = catalogRoot || null;
		this.yesodConnected = false;
		this.handleYesodCardTap = this.handleYesodCardTap.bind(this);
	}

	/** Connects the delegated tap listener once. @returns {void} */
	connect() {
		if (this.yesodConnected || !this.yesodCatalogRoot) {
			return;
		}
		this.yesodCatalogRoot.addEventListener('click', this.handleYesodCardTap);
		this.yesodConnected = true;
	}

	/** Disconnects the delegated tap listener. @returns {void} */
	disconnect() {
		if (!this.yesodConnected || !this.yesodCatalogRoot) {
			return;
		}
		this.yesodCatalogRoot.removeEventListener('click', this.handleYesodCardTap);
		this.yesodConnected = false;
	}

	/**
	 * Navigates when a card body (not an inner control) is tapped.
	 * @param {Event} yesodClickEvent Browser click event.
	 * @returns {void}
	 */
	handleYesodCardTap(yesodClickEvent) {
		const hodTarget = yesodClickEvent.target;
		if (!hodTarget || typeof hodTarget.closest !== 'function') {
			return;
		}
		// Never hijack taps meant for real controls (Play/Party buttons, links, filters).
		if (hodTarget.closest(HOD_INTERACTIVE_SELECTOR)) {
			return;
		}
		const malchusCard = hodTarget.closest('.gameCard');
		if (!malchusCard || !this.yesodCatalogRoot.contains(malchusCard)) {
			return;
		}
		const hodPrimaryLink =
			malchusCard.querySelector('.gameTitleLink') ||
			malchusCard.querySelector('.playCta');
		const hodHref = hodPrimaryLink?.getAttribute('href');
		if (hodHref) {
			// Let the SPA shell/router observe a real navigation; use assign
			// so history stays honest like a normal link tap.
			window.location.assign(hodHref);
		}
	}
}
