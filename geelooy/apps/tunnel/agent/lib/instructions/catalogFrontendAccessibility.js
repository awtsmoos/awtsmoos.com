// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file Frontend accessibility, keyboard, focus, semantics, and motion doctrine.
 * @description The Awtsmoos is revealed through every human vessel; Awtsmoos.com treats keyboard,
 * screen-reader, touch, motion, and visual access as behavior rather than optional polish.
 */
const frontendAccessibilityInstructions = Object.freeze([
	instructionPack({
		id: "frontend.accessibility-interaction",
		version: 2,
		summary: "Verify semantics, keyboard/focus, ARIA state, touch targets, contrast, and reduced motion.",
		tags: ["frontend", "accessibility", "a11y", "keyboard", "focus", "aria", "motion"],
		applies: {
			pathHints: ["/components/", "/views/", "/pages/", "/ui/", "/apps/tunnel-control/"],
			taskHints: ["button", "switch", "toggle", "dialog", "modal", "menu", "drawer", "keyboard", "focus", "aria", "accessibility", "animation", "motion"]
		},
		instructions: [
			"Use native semantic elements when they express the interaction. Do not recreate buttons, links, checkboxes, radios, selects, or dialogs from generic divs without a demonstrated need.",
			"For every interactive control verify all three together: the event fires, visible state changes, and semantic or ARIA state mirrors the real state.",
			"Every modal, drawer, popover, and menu needs an intentional keyboard model: reachable trigger, predictable Tab order, Escape behavior where appropriate, modal focus containment, and focus restoration on close.",
			"Never remove visible focus without an equally obvious focus-visible treatment. Test the flow keyboard-only from entry through completion and back out again.",
			"Interactive touch targets should be at least 44px by 44px with enough separation to avoid accidental activation; verify the actual hit box, not only the icon glyph.",
			"Keep normal UI text at 12px or larger unless a documented design/accessibility exception exists. Exercise browser zoom and platform text scaling where practical.",
			"Icon-only controls need accessible names. Decorative icons should not create duplicate spoken labels; status/error/progress semantics must match urgency without noisy live regions.",
			"Every motion path must respect prefers-reduced-motion while preserving equivalent meaning and feedback.",
			"Check contrast and state differentiation across default, hover, focus, active, disabled, selected, error, success, and forced/high-contrast environments where supported.",
			"Do not use color, motion, position, or hover as the sole carrier of critical meaning.",
			"If accessibility cannot be exercised in the available runtime, state exactly what remains unverified instead of inferring it from markup."
		]
	})
]);

module.exports = { frontendAccessibilityInstructions };
