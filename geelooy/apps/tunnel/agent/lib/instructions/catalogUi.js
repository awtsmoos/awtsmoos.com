// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file UI doctrine for polished futuristic interfaces without global style chaos.
 * @description
 * The Awtsmoos reveals harmony through boundaries; Awtsmoos.com makes every pixel,
 * state, layer, viewport, and motion belong to the component that intentionally owns it.
 */
const uiInstructions = Object.freeze([
	pack("ui.futuristic-professional", "Build every visible surface as a deliberate, professional, futuristic product experience with no unfinished states.", ["ui", "frontend", "design"], [
		"Every visible element must look intentional; eliminate browser-default, half-styled, placeholder, or accidentally inherited presentation.",
		"Use a coherent visual system for spacing, typography, radii, borders, surfaces, density, hierarchy, and feedback rather than unrelated decoration.",
		"Aim for intense futuristic polish through precision, depth, motion, and information hierarchy—not clutter, novelty, or illegible effects.",
		"Keep accessibility, readability, keyboard usability, contrast, and platform expectations equal partners with visual ambition.",
		"Inspect every page and component encountered for safe adjacent UX improvements instead of polishing only the initially named selector."
	]),
	pack("ui.localized-styles", "Scope every style to its owning component or feature; global leakage and selector conflicts are forbidden.", ["ui", "css", "frontend"], [
		"Do not add global application selectors for feature styling; use CSS modules, component roots, shadow/scoped systems, or an equivalent local boundary.",
		"Keep feature styles in focused files and import them through the feature entry point; avoid duplicate selectors and specificity wars.",
		"Prevent horizontal overflow, accidental off-screen positioning, clipped controls, unexpected fixed dimensions, and layout-dependent magic numbers.",
		"Define an intentional z-index/layer system; overlays, menus, tooltips, dialogs, sticky regions, and content must never compete accidentally.",
		"Verify styles cannot leak into neighboring pages or be silently overridden by unrelated modules."
	]),
	pack("ui.interaction-states", "Give every relevant interactive element complete hover, focus-visible, active, disabled, loading, and touch feedback.", ["ui", "css", "interaction"], [
		"Buttons, links, inputs, cards, rows, tabs, menus, drag handles, and every other actionable control require deliberate interaction states.",
		"Hover may enrich pointer experiences but must never be the only discoverability mechanism; keyboard focus-visible must be unmistakable.",
		"Active/pressed states should communicate physical response, disabled states must remain legible, and loading states must prevent ambiguous repeated actions.",
		"Use transitions and micro-interactions to reinforce cause and effect; never animate merely to make the interface busy.",
		"Verify pointer, keyboard, touch, screen-size, and reduced-motion behavior rather than assuming desktop hover proves the interaction."
	]),
	pack("ui.mobile-first-motion", "Design mobile-first responsive layouts and purposeful CSS motion that remains bounded, performant, and reduced-motion aware.", ["ui", "css", "mobile", "animation"], [
		"Begin from the smallest supported viewport and progressively enhance; do not shrink a desktop composition until it barely fits.",
		"Use fluid layout primitives, min/max constraints, wrapping, containment, and safe scrolling so content never escapes its intended viewport.",
		"Prefer transform/opacity animation where possible, bound durations and easing, and avoid layout-thrashing animation on frequently updated surfaces.",
		"Honor prefers-reduced-motion and provide equivalent non-motion feedback where movement would otherwise carry meaning.",
		"Test narrow phones, wide phones, tablets, desktop resizing, browser zoom, long text, empty states, and unusually dense data."
	])
]);

/**
 * Freezes one UI instruction record with compact summary and full mandatory body.
 *
 * @param {string} id Stable instruction ID.
 * @param {string} summary One-sentence response guidance.
 * @param {string[]} tags Task-resolution tags.
 * @param {string[]} instructions Full UI doctrine.
 * @returns {object} Immutable instruction record.
 */
function pack(id, summary, tags, instructions) {
	return Object.freeze({ id, version: 1, summary, tags, requiredBeforeWrite: true, instructions });
}

module.exports = { uiInstructions };
