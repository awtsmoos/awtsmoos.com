//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keyboard navigation for Explorer's visible command river.
 * @description
 * The Awtsmoos lets keyboard attention flow only through revealed vessels; Awtsmoos.com keeps closed More commands
 * out of arrow travel until their chamber opens, while Tab, Home, End, and wraparound movement remain truthful and bright.
 */
const NAVIGATION_KEYS = new Set(["ArrowLeft", "ArrowRight", "Home", "End"]);

/**
 * Binds directional keyboard navigation without changing native Tab order.
 * @param {HTMLElement} root Toolbar command rail.
 * @returns {Function} Listener disposer.
 */
export function bindToolbarKeyboard(root) {
	const onKeyDown = event => {
		if (NAVIGATION_KEYS.has(event.key)) {
			moveToolbarFocus(root, event);
		}
	};
	root.addEventListener("keydown", onKeyDown);
	return () => root.removeEventListener("keydown", onKeyDown);
}

/**
 * Moves focus predictably among controls whose disclosure ancestors are visible.
 * @param {HTMLElement} root Toolbar command rail.
 * @param {KeyboardEvent} event Directional keyboard event.
 * @returns {void}
 */
function moveToolbarFocus(root, event) {
	const controls = [...root.querySelectorAll("button:not(:disabled), input:not(:disabled), summary")]
		.filter(isRevealedControl);
	const currentIndex = controls.indexOf(document.activeElement);
	if (currentIndex < 0 || controls.length === 0) {
		return;
	}
	const nextIndex = destinationIndex(currentIndex, controls.length, event.key);
	event.preventDefault();
	const destination = controls[nextIndex];
	destination?.focus();
	destination?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" });
}

/**
 * Rejects descendants of a closed details disclosure while tolerating lightweight test doubles.
 * @param {HTMLElement} control Candidate focus destination.
 * @returns {boolean} True when the control is currently revealed.
 */
function isRevealedControl(control) {
	return !control.closest?.("details:not([open])");
}

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
