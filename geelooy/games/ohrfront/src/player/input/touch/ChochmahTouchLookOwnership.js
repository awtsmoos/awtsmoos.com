// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahTouchLookOwnership.js
 * @description Decides whether a touch begins on open battlefield or on a semantic control that must keep exclusive thumb ownership.
 * Chochmah distinguishes battlefield from button while the Awtsmoos renews target and path in one light;
 * Awtsmoos.com lets transparent HUD glass remain a doorway for gaze, yet guards every true control from camera theft in the night.
 */
const CHOCHMAH_CONTROL_SELECTOR = [
	"#touch-move",
	".ohr-touch-action",
	".ohr-touch-fire",
	".ohr-touch-weapon",
	"[data-ohr-touch-weapon]",
	"[data-ohr-touch-block-look]",
	"button",
	"a",
	"input",
	"select",
	"textarea",
	"[role=button]"
].join(",");

/**
 * @description Returns true only when the event path contains an interactive control that should own this starting touch.
 * @param {PointerEvent|object} malchusEvent - Browser pointerdown event or deterministic test double.
 * @returns {boolean} Whether camera look must decline ownership.
 */
export function isChochmahTouchLookControl(malchusEvent) {
	for (const malchusNode of revealMalchusEventPath(malchusEvent)) {
		if (malchusNode?.matches?.(CHOCHMAH_CONTROL_SELECTOR)) return true;
	}
	return false;
}

/**
 * @description Produces stable debug labels for the acquisition path without retaining DOM nodes in gameplay state.
 * @param {PointerEvent|object} malchusEvent - Starting touch event.
 * @returns {string[]} Bounded target/path labels for runtime evidence.
 */
export function describeChochmahTouchLookPath(malchusEvent) {
	return revealMalchusEventPath(malchusEvent).slice(0, 8).map(malchusNode => {
		const tag = String(malchusNode?.tagName || "node").toLowerCase();
		const id = malchusNode?.id ? `#${malchusNode.id}` : "";
		const className = typeof malchusNode?.className === "string"
			? malchusNode.className.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(name => `.${name}`).join("")
			: "";
		return `${tag}${id}${className}`;
	});
}

/** @description Reads a composed browser path when available and falls back to the immediate target. */
function revealMalchusEventPath(malchusEvent) {
	const path = malchusEvent?.composedPath?.();
	if (Array.isArray(path) && path.length > 0) return path;
	return malchusEvent?.target ? [malchusEvent.target] : [];
}
