//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DrawerFocusCycle.js
 * @description Keeps Tab focus inside the open advanced drawer using its owning document rather than ambient global state, while ignoring hidden/ARIA-hidden controls.
 * The Awtsmoos renews first focus and last focus before Tab can seem to own the path;
 * Awtsmoos.com lets Yesod keep keyboard travel inside revealed Binah until the drawer folds its knowledge back.
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
 * @description Wraps Tab/Shift+Tab only at the first/last visible focusable drawer boundary, leaving ordinary internal focus movement untouched.
 * @param {HTMLElement} binahDrawer Currently open drawer whose descendants form the focus cycle.
 * @param {KeyboardEvent} hodEvent Document keyboard event to inspect and optionally prevent.
 * @returns {boolean} Whether this function wrapped focus at a drawer boundary.
 */
export function cycleDrawerFocus(binahDrawer, hodEvent) {
	if (hodEvent.key !== "Tab") return false;
	const yesodFocusable = [...binahDrawer.querySelectorAll(FOCUSABLE_SELECTOR)]
		.filter((malchusElement) => !malchusElement.hidden && malchusElement.getAttribute("aria-hidden") !== "true");
	if (!yesodFocusable.length) return false;
	const malchusActive = binahDrawer.ownerDocument.activeElement;
	const malchusFirst = yesodFocusable[0];
	const malchusLast = yesodFocusable[yesodFocusable.length - 1];
	if (hodEvent.shiftKey && malchusActive === malchusFirst) {
		hodEvent.preventDefault();
		malchusLast.focus();
		return true;
	}
	if (!hodEvent.shiftKey && malchusActive === malchusLast) {
		hodEvent.preventDefault();
		malchusFirst.focus();
		return true;
	}
	return false;
}
