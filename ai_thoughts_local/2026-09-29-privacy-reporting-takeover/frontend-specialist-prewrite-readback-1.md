
===== geelooy/apps/tunnel/agent/lib/instructions/catalogFrontendSystem.js =====
// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file Frontend system-mapping and DOM/CSS contract doctrine.
 * @description The Awtsmoos reveals one interface through many vessels; Awtsmoos.com therefore
 * maps DOM, style, state, and ownership before change so no invisible contract is broken by haste.
 */
const frontendSystemInstructions = Object.freeze([
	instructionPack({
		id: "frontend.system-map",
		version: 1,
		summary: "Map the complete component ownership, DOM, style, state, loading, and dependency graph before frontend edits.",
		tags: ["frontend", "ui", "dom", "component", "architecture", "ownership"],
		applies: {
			pathHints: ["/frontend/", "/components/", "/views/", "/pages/", "/ui/", "/apps/"],
			taskHints: ["frontend", "component", "page", "widget", "header", "menu", "dialog", "drawer", "modal", "toolbar"]
		},
		instructions: [
			"Before editing a component, identify every file that creates its DOM, styles it, mutates its state, injects assets, subscribes to events, or controls its loading lifecycle.",
			"Build a compact ownership map: DOM producer, state owner, style owner, event owner, data source, asset owner, and deployment/public path. Do not create a second owner when one already exists.",
			"Trace the component from initial HTML/server shell through client initialization to interactive state. Record what exists before JavaScript, what appears after JavaScript, and what can fail between those states.",
			"Find duplicate implementations, stale feature variants, hidden fallback markup, shadow DOM, portals, injected fragments, and conditional branches before deciding where a fix belongs.",
			"Treat layout, styling, accessibility, interaction, data state, and loading state as one user-visible system. A local visual fix that breaks another state is not complete.",
			"When a component spans multiple files, identify the canonical source of truth for structure, state, style tokens, and public behavior before writing."
		]
	}),
	instructionPack({
		id: "frontend.dom-css-contracts",
		version: 1,
		summary: "Keep classes, data attributes, ARIA state, selectors, and JavaScript behavior synchronized as explicit contracts.",
		tags: ["frontend", "dom", "css", "selectors", "attributes", "contracts"],
		applies: {
			taskHints: ["class", "selector", "data-state", "aria", "dom", "css", "toggle", "state attribute", "stylesheet"]
		},
		instructions: [
			"Never emit a class from HTML or JavaScript without proving a matching loaded style exists when that class is expected to carry presentation. An unstyled required class is a defect, not a TODO.",
			"Whenever JavaScript and CSS communicate through classes, data attributes, custom properties, or ARIA state, grep both sides and verify exact names and values still agree.",
			"If CSS expects `[data-state=offline]`, JavaScript must set exactly that contract. Do not tolerate near-miss aliases that silently make selectors dead.",
			"When renaming a class or attribute, search templates, renderers, event delegation, tests, analytics hooks, stylesheets, and documentation before removal.",
			"Prefer semantic state markers over styling-only JavaScript. JavaScript should express state; CSS should normally express presentation from that state.",
			"Delete dead selectors and dead emitted classes after proving they have no runtime producer/consumer. Do not preserve contradictory contracts just in case."
		]
	})
]);

module.exports = { frontendSystemInstructions };

===== geelooy/apps/tunnel/agent/lib/instructions/catalogFrontendAccessibility.js =====
// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file Frontend accessibility, keyboard, focus, semantics, and motion doctrine.
 * @description The Awtsmoos is revealed through every human vessel; Awtsmoos.com therefore treats
 * keyboard, screen-reader, touch, motion, and visual access as core behavior rather than polish.
 */
const frontendAccessibilityInstructions = Object.freeze([
	instructionPack({
		id: "frontend.accessibility-interaction",
		version: 1,
		summary: "Verify semantic controls, keyboard/focus behavior, ARIA state, touch targets, contrast, and reduced motion end-to-end.",
		tags: ["frontend", "accessibility", "a11y", "keyboard", "focus", "aria", "motion"],
		applies: {
			pathHints: ["/components/", "/views/", "/pages/", "/ui/", "/apps/"],
			taskHints: ["button", "switch", "toggle", "dialog", "modal", "menu", "drawer", "keyboard", "focus", "aria", "accessibility", "animation", "motion"]
		},
		instructions: [
			"Use native semantic elements when they express the interaction. Do not recreate buttons, links, checkboxes, radios, selects, or dialogs from generic divs without a demonstrated need.",
			"For every interactive control verify three layers together: the input/event fires, visible state changes, and semantic/ARIA state mirrors the real state. A decorative toggle with stale aria-checked is broken.",
			"Every modal, drawer, popover, and menu must have an intentional keyboard model: reachable trigger, predictable Tab order, Escape behavior where appropriate, focus containment when modal, and focus restoration on close.",
			"Never remove visible focus without supplying an equally obvious focus-visible treatment. Test keyboard navigation without a mouse from entry through completion and back out again.",
			"Interactive touch targets should be at least 44px by 44px with enough separation to avoid accidental activation; verify the actual hit box, not only the icon glyph.",
			"Keep normal UI text at 12px or larger unless a documented design/accessibility exception exists. Verify text at browser zoom and with platform font scaling where practical.",
			"Accessible names must remain meaningful when icons replace text. Decorative icons should not become duplicate spoken labels; icon-only controls need an accessible name.",
			"Status messages, errors, progress, and asynchronous completion need semantics appropriate to their urgency. Do not spam live regions for routine updates.",
			"Every motion path must respect prefers-reduced-motion. Reduced motion must preserve meaning and feedback instead of simply making essential state changes invisible.",
			"Check contrast and state differentiation for default, hover, focus, active, disabled, selected, error, success, and forced/high-contrast environments when supported.",
			"Do not use color, animation, position, or hover alone as the only carrier of critical meaning. Preserve an equivalent textual, semantic, or structural signal.",
			"If accessibility cannot be exercised in the available browser/runtime, state exactly what remains unverified instead of inferring compliance from markup alone."
		]
	})
]);

module.exports = { frontendAccessibilityInstructions };

===== geelooy/apps/tunnel/agent/lib/instructions/catalogFrontendResponsive.js =====
// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file Responsive and mobile resilience doctrine for real phones and changing viewports.
 * @description The Awtsmoos fills every measure without being bounded by measure; Awtsmoos.com
 * therefore lets interfaces bend with content, language, keyboard, orientation, and human scale.
 */
const frontendResponsiveInstructions = Object.freeze([
	instructionPack({
		id: "frontend.responsive-mobile",
		version: 1,
		summary: "Verify responsive UI against small phones, zoom, safe areas, orientation, text expansion, keyboards, and input capabilities.",
		tags: ["frontend", "responsive", "mobile", "viewport", "zoom", "safe-area"],
		applies: {
			extensions: [".css", ".scss", ".sass", ".less", ".html"],
			pathHints: ["/frontend/", "/components/", "/views/", "/pages/", "/ui/", "/tunnel-control/"],
			taskHints: ["responsive", "mobile", "breakpoint", "viewport", "orientation", "safe area", "zoom", "tablet", "overflow"]
		},
		instructions: [
			"Treat 390px as a mandatory phone verification width for ordinary UI work and inspect a narrower width such as 320px when density could matter; add representative tablet and desktop widths.",
			"Choose breakpoints from content failure, not device folklore. Add a breakpoint where composition stops fitting or reading well, not merely because a familiar device width exists.",
			"Avoid fixed widths that can overflow a small viewport. Prefer intrinsic sizing, min/max constraints, clamp(), flexible grid/flex behavior, and container queries when they simplify local component responsiveness.",
			"Test long labels, realistic worst-case content, translated text expansion, missing assets, and slow assets. Use ellipsis only when loss of hidden text is acceptable and the full value remains reachable when necessary.",
			"Verify browser zoom and larger platform text. A layout that works only at default zoom and font scale is fragile.",
			"Account for safe-area insets when fixed or edge-attached controls can collide with notches, home indicators, or browser chrome.",
			"Use dvh/svh and related viewport units deliberately where mobile browser chrome or virtual keyboards change usable height; do not assume 100vh equals the visible screen.",
			"Test portrait and landscape when full-height panels, media, keyboards, sticky regions, or dense toolbars can change materially.",
			"Do not use hover as the only path to essential actions or information. Distinguish pointer and hover capability from viewport width when behavior depends on input method.",
			"When the on-screen keyboard appears, focused fields and primary actions must remain reachable; fixed overlays must not cover the active input without recovery.",
			"Inspect horizontal scrolling explicitly. If horizontal overflow is intentional, contain and communicate it; page-level accidental overflow is a defect.",
			"Verify sticky/fixed headers, drawers, dialogs, toasts, and bottom actions together because independent responsive rules can collide even when each component looks correct alone."
		]
	})
]);

module.exports = { frontendResponsiveInstructions };
