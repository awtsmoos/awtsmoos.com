//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DrawerFocusCycle.js
 * @description Keeps keyboard focus inside the open advanced drawer using its owning document rather than any ambient global browser reference.
 * The Awtsmoos renews first focus and last focus before Tab can seem to own the path;
 * Awtsmoos.com lets Yesod keep keyboard travel inside revealed detail until Binah folds the drawer back.
 */

const FOCUSABLE_SELECTOR = [
	"button:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"summary",
	"a[href]",
	"[tabindex]:not([tabindex='-1'])"
].join(",");

/**
 * Cycles Tab focus within one open drawer and returns whether boundary wrapping occurred.
 * @param {HTMLElement} binahDrawer Open drawer element.
 * @param {KeyboardEvent} hodEvent Keyboard event.
 * @returns {boolean} Whether focus was wrapped at a drawer boundary.
 */
export function cycleDrawerFocus(binahDrawer, hodEvent) {
	if (hodEvent.key !== "Tab") return false;
	const focusable = [...binahDrawer.querySelectorAll(FOCUSABLE_SELECTOR)]
		.filter((element) => !element.hidden && element.getAttribute("aria-hidden") !== "true");
	if (!focusable.length) return false;
	const activeElement = binahDrawer.ownerDocument.activeElement;
	const first = focusable[0];
	const last = focusable[focusable.length - 1];
	if (hodEvent.shiftKey && activeElement === first) {
		hodEvent.preventDefault();
		last.focus();
		return true;
	}
	if (!hodEvent.shiftKey && activeElement === last) {
		hodEvent.preventDefault();
		first.focus();
		return true;
	}
	return false;
}
