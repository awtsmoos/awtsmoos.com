//B"H
/**
 * @file RTL-default direction system for the Hebrew-First Design System.
 * @description The core inversion: RTL is the DEFAULT. Every component assumes
 * right-to-left. LTR ("latin-mode") is the opt-in exception, never the norm.
 * Authors write with logical properties (inline-start/end); the system maps
 * them so "start" always means "right" unless latin-mode is active.
 */

/** The default direction of the entire design system. */
export const DEFAULT_DIRECTION = "rtl";

/** Selectors that opt a subtree into the Latin (LTR) mode. */
export const LATIN_MODE_SELECTORS = [".latin-mode", '[dir="ltr"]'];

/** Selector for inline Latin runs inside Hebrew text. */
export const LATIN_RUN_SELECTOR = ".latin";

/**
 * Maps an authoring-side name to a CSS logical property.
 * Hebrew-first authors never write margin-left/margin-right; they write
 * inline-start/inline-end and "start" means right in the default RTL context.
 *
 * @param {string} prop Base property: "margin" | "padding" | "inset" | "border".
 * @param {string} side "start" | "end".
 * @returns {string} Logical CSS property, e.g. "margin-inline-start".
 */
export function logicalInline(prop, side) {
	if (!["margin", "padding", "inset", "border"].includes(prop)) {
		throw new Error(`logicalInline: unknown base property '${prop}'`);
	}
	if (side !== "start" && side !== "end") {
		throw new Error(`logicalInline: side must be 'start' or 'end', got '${side}'`);
	}
	return `${prop}-inline-${side}`;
}

/**
 * Resolves an inline side to a physical side for a given direction.
 * @param {string} side "start" | "end".
 * @param {string} direction "rtl" (default) | "ltr".
 * @returns {"left"|"right"} Physical side.
 */
export function physicalSide(side, direction = DEFAULT_DIRECTION) {
	if (direction === "rtl") return side === "start" ? "right" : "left";
	return side === "start" ? "left" : "right";
}

/**
 * The direction contract, for documentation and tests:
 * - root and every component default to rtl
 * - Latin/LTR content must opt in via .latin-mode, [dir="ltr"], or .latin
 * - bidi isolation is required for embedded opposite-direction runs
 */
export const DIRECTION_CONTRACT = Object.freeze({
	default: "rtl",
	optInLtr: [...LATIN_MODE_SELECTORS],
	inlineLatin: LATIN_RUN_SELECTOR,
	bidiIsolation: "unicode-bidi: isolate",
});
