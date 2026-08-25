// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file UI layout doctrine for scoped styles, progressive disclosure, and spatial integrity.
 * @description
 * The Awtsmoos reveals many controls inside one ordered field. Awtsmoos.com therefore
 * gives every component a boundary, every layer a purpose, and every viewport room to breathe.
 */
const uiLayoutInstructions = Object.freeze([
	instructionPack({
		id: "ui.localized-styles",
		summary: "Scope every style to its owning feature or component; global leakage and selector conflicts are forbidden.",
		tags: ["ui", "css", "frontend", "styles"],
		applies: { extensions: [".css", ".scss", ".sass", ".less"], taskHints: ["style", "css", "theme"] },
		instructions: [
			"Use component roots, CSS modules, scoped/shadow systems, or another explicit local boundary for feature styling.",
			"Keep feature styles in focused files imported through the feature entry point; avoid duplicate selectors and specificity wars.",
			"Do not introduce broad global selectors for one page's appearance, and verify neighboring pages cannot be silently altered.",
			"Shared tokens may be global only when they are intentionally stable primitives rather than page-specific presentation."
		]
	}),
	instructionPack({
		id: "ui.layout-integrity",
		summary: "Prevent overflow, accidental overlap, off-screen placement, clipped controls, and undisciplined z-index at every viewport.",
		tags: ["ui", "css", "layout", "z-index", "responsive"],
		applies: { taskHints: ["layout", "overlay", "modal", "menu", "overflow", "z-index"] },
		instructions: [
			"Use fluid layout primitives, min/max constraints, wrapping, containment, and intentional scrolling so elements stay inside their designed vessels.",
			"Define an explicit layer model for content, sticky regions, menus, tooltips, dialogs, and emergency overlays instead of arbitrary z-index escalation.",
			"Test long labels, zoom, narrow screens, large screens, empty states, dense data, and dynamic content for accidental clipping or overlap.",
			"No control may drift off-screen, hide behind another layer, or become unreachable because of positioning shortcuts."
		]
	}),
	instructionPack({
		id: "ui.progressive-disclosure",
		summary: "Keep the default interface clean and simple while advanced capability expands through deliberate retractable controls.",
		tags: ["ui", "ux", "retractable", "advanced", "simple"],
		applies: { taskHints: ["menu", "panel", "advanced", "settings", "retractable", "expandable", "drawer"] },
		instructions: [
			"Show the most common action first; place advanced capability behind clearly labeled expandable panels, drawers, accordions, or menus.",
			"Expansion must preserve context and never cause unrelated content to jump, overlap, or leave the viewport unexpectedly.",
			"Remember state only when doing so helps the user; provide obvious collapse/reset paths and keyboard-accessible disclosure controls.",
			"A powerful screen should feel simple before expansion and complete after expansion, never cluttered in either state."
		]
	}),
	instructionPack({
		id: "ui.mobile-first-structure",
		summary: "Design from the smallest supported viewport upward; do not shrink a desktop composition until it barely fits.",
		tags: ["ui", "mobile", "responsive", "layout"],
		applies: { taskHints: ["mobile", "responsive", "phone", "tablet"] },
		instructions: [
			"Start with touch-safe spacing, readable density, natural wrapping, and one-column priorities before progressively enhancing larger layouts.",
			"Menus, drawers, tables, cards, and advanced controls must remain usable without horizontal page overflow.",
			"Test viewport resizing, browser zoom, long localized strings, software keyboard intrusion, and safe-area behavior.",
			"Desktop enhancements must not create a second incompatible interaction model that mobile users cannot reach."
		]
	})
]);

module.exports = { uiLayoutInstructions };
