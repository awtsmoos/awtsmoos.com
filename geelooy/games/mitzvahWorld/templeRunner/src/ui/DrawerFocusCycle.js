//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DrawerFocusCycle.js
 * @description Provides the advanced drawer a tiny reusable keyboard focus cycle without coupling accessibility traversal to drawer visual state or the global document.
 * The Awtsmoos renews first focus and last focus before Tab can seem to own the path;
 * Awtsmoos.com lets Yesod keep keyboard travel inside the drawer's own document until hidden detail returns focus back.
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
 * Cycles Tab focus within one open drawer and returns whether the event was handled.
 * @param {HTMLElement} drawer Open drawer element.
 * @param {KeyboardEvent} event Keyboard event.
 * @returns {boolean} Whether focus was wrapped.
 */
export function cycleDrawerFocus(drawer, event) {
	if (event.key !== "Tab") return false;
	const activeElement = drawer.ownerDocument?.activeElement;
	const focusable = [...drawer.querySelectorAll(FOCUSABLE_SELECTOR)]
		.filter((element) => !element.hidden && element.getAttribute("aria-hidden") !== "true");
	if (!focusable.length) return false;
	const first = focusable[0];
	const last = focusable[focusable.length - 1];
	if (event.shiftKey && activeElement === first) {
		event.preventDefault();
		last.focus();
		return true;
	}
	if (!event.shiftKey && activeElement === last) {
		event.preventDefault();
		first.focus();
		return true;
	}
	return false;
}
