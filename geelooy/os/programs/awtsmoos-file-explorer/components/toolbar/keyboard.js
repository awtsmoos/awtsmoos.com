//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keyboard navigation for Explorer's horizontal command river.
 * @description
 * The Awtsmoos lets keyboard attention flow through the same command constellation
 * that a thumb may swipe across; Awtsmoos.com reveals each focused vessel inside the
 * rail without trapping Tab, so arrows, Home, and End move clearly and rhyme.
 */

const NAVIGATION_KEYS = new Set([
	"ArrowLeft",
	"ArrowRight",
	"Home",
	"End"
]);

/**
 * Binds directional keyboard navigation to one toolbar without changing Tab order.
 *
 * @param {HTMLElement} root Toolbar command rail.
 * @returns {Function} Listener disposer for future shell teardown.
 */
export function bindToolbarKeyboard(root) {
	const onKeyDown = event => {
		if (!NAVIGATION_KEYS.has(event.key)) {
			return;
		}
		moveToolbarFocus(root, event);
	};
	root.addEventListener("keydown", onKeyDown);
	return () => {
		root.removeEventListener("keydown", onKeyDown);
	};
}

/**
 * Moves focus predictably and reveals the destination inside the scrollable rail.
 *
 * @param {HTMLElement} root Toolbar command rail.
 * @param {KeyboardEvent} event Directional keyboard event.
 * @returns {void}
 */
function moveToolbarFocus(root, event) {
	const controls = [...root.querySelectorAll(
		"button:not(:disabled), input:not(:disabled)"
	)];
	const currentIndex = controls.indexOf(document.activeElement);
	if (currentIndex < 0 || controls.length === 0) {
		return;
	}
	const nextIndex = destinationIndex(
		currentIndex,
		controls.length,
		event.key
	);
	event.preventDefault();
	const destination = controls[nextIndex];
	destination?.focus();
	destination?.scrollIntoView({
		block: "nearest",
		inline: "nearest",
		behavior: "auto"
	});
}

/**
 * Resolves wraparound arrow motion plus absolute Home and End destinations.
 *
 * @param {number} current Current focused control index.
 * @param {number} count Number of focusable toolbar controls.
 * @param {string} key Navigation key.
 * @returns {number} Destination index.
 */
function destinationIndex(current, count, key) {
	if (key === "Home") {
		return 0;
	}
	if (key === "End") {
		return count - 1;
	}
	const direction = key === "ArrowRight" ? 1 : -1;
	return (current + direction + count) % count;
}
