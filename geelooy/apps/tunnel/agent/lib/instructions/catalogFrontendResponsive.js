// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file Responsive and mobile resilience doctrine for real phones and changing viewports.
 * @description The Awtsmoos fills every measure without being bounded by measure; Awtsmoos.com
 * lets interfaces bend with content, language, keyboards, orientation, zoom, and human scale.
 */
const frontendResponsiveInstructions = Object.freeze([
	instructionPack({
		id: "frontend.responsive-mobile",
		version: 2,
		summary: "Verify small phones, zoom, safe areas, orientation, text expansion, keyboards, and input capabilities.",
		tags: ["frontend", "responsive", "mobile", "viewport", "zoom", "safe-area"],
		applies: {
			extensions: [".css", ".scss", ".sass", ".less", ".html"],
			pathHints: ["/frontend/", "/components/", "/views/", "/pages/", "/ui/", "/apps/tunnel-control/"],
			taskHints: ["responsive", "mobile", "breakpoint", "viewport", "orientation", "safe area", "zoom", "tablet", "overflow"]
		},
		instructions: [
			"Treat 390px as a mandatory phone verification width for ordinary UI work; inspect a narrower width such as 320px when density matters, plus representative tablet and desktop widths.",
			"Choose breakpoints from content failure rather than device folklore. Add a breakpoint where composition stops fitting or reading well.",
			"Avoid fixed widths that can overflow small viewports. Prefer intrinsic sizing, min/max constraints, clamp(), flexible grid/flex behavior, and container queries where they simplify local responsiveness.",
			"Test long labels, realistic worst-case content, translated text expansion, missing assets, and slow assets. Use ellipsis only when hiding content is acceptable and the full value remains reachable when needed.",
			"Verify browser zoom and larger platform text. A layout that works only at default zoom or font scale is fragile.",
			"Account for safe-area insets when edge-attached controls can collide with notches, home indicators, or browser chrome.",
			"Use dvh/svh and related viewport units deliberately where mobile browser chrome or virtual keyboards change usable height; do not assume 100vh equals the visible screen.",
			"Test portrait and landscape when full-height panels, media, keyboards, sticky regions, or dense toolbars can change materially.",
			"Do not use hover as the only path to essential actions or information. Distinguish pointer/hover capability from viewport width.",
			"When the on-screen keyboard appears, focused fields and primary actions must remain reachable; fixed overlays must not cover the active input without recovery.",
			"Inspect horizontal scrolling explicitly. If overflow is intentional, contain and communicate it; accidental page-level overflow is a defect.",
			"Verify sticky/fixed headers, drawers, dialogs, toasts, banners, and bottom actions together because independently correct responsive rules can still collide."
		]
	})
]);

module.exports = { frontendResponsiveInstructions };
