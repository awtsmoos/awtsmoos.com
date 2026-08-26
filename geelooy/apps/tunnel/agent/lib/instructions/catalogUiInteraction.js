// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file UI interaction doctrine for polished states, motion, and complete styling.
 * @description
 * The Awtsmoos gives every visible action a response and every response a boundary.
 * Awtsmoos.com therefore rejects unfinished controls, inert states, and motion without meaning.
 */
const uiInteractionInstructions = Object.freeze([
	instructionPack({
		id: "ui.futuristic-professional",
		summary: "Build every visible surface as a deliberate, professional, futuristic product experience without decorative clutter.",
		tags: ["ui", "design", "frontend", "futuristic"],
		applies: { taskHints: ["page", "component", "ui", "design", "polish", "futuristic"] },
		instructions: [
			"Use coherent spacing, typography, radii, borders, surfaces, hierarchy, and feedback rather than unrelated effects.",
			"Create intensity through precision, depth, micro-interaction, and information hierarchy; do not confuse futuristic with noisy.",
			"Accessibility, contrast, readability, keyboard navigation, and platform expectations remain equal partners with visual ambition.",
			"Every visible state should look intentionally designed rather than inherited accidentally from browser defaults."
		]
	}),
	instructionPack({
		id: "ui.interaction-states",
		summary: "Give every relevant interactive element deliberate hover, focus-visible, active, disabled, loading, and touch feedback.",
		tags: ["ui", "interaction", "css", "accessibility"],
		applies: { taskHints: ["button", "link", "input", "card", "row", "tab", "menu", "interactive"] },
		instructions: [
			"Buttons, links, inputs, cards, tabs, menus, drag handles, and actionable rows require complete interaction-state design.",
			"Hover may enrich pointer use but cannot be the only discoverability mechanism; focus-visible must be obvious and beautiful.",
			"Active/pressed states should communicate physical response; disabled and loading states must remain legible and unambiguous.",
			"Verify pointer, keyboard, touch, and assistive interaction rather than assuming desktop hover proves the control."
		]
	}),
	instructionPack({
		id: "ui.motion-discipline",
		summary: "Use CSS motion to reinforce cause and effect; keep it performant, bounded, and reduced-motion aware.",
		tags: ["ui", "css", "animation", "motion"],
		applies: { taskHints: ["animation", "transition", "motion", "hover"] },
		instructions: [
			"Prefer transform and opacity for frequent motion; avoid layout-thrashing animation on busy or continuously updating surfaces.",
			"Use consistent durations and easing so the product feels like one system instead of a collection of unrelated tricks.",
			"Honor prefers-reduced-motion and preserve equivalent non-motion feedback when motion carries meaning.",
			"Animate disclosure, state transitions, confirmation, and spatial continuity; do not animate merely because animation exists."
		]
	}),
	instructionPack({
		id: "ui.complete-styling",
		summary: "No visible element may remain accidentally plain, half-styled, conflicting, or visually orphaned from its surrounding system.",
		tags: ["ui", "css", "quality", "complete"],
		applies: { taskHints: ["unstyled", "plain", "cleanup", "consistency", "finish"] },
		instructions: [
			"Inspect headings, helper text, empty states, error states, separators, icons, scroll areas, controls, and secondary metadata—not only hero components.",
			"Remove unexplained browser-default presentation and mismatched spacing/typography when the feature owns that surface.",
			"Ensure disabled, empty, loading, error, selected, expanded, and collapsed states remain visually coherent with the default state.",
			"Do not create a polished island surrounded by visibly unfinished supporting UI."
		]
	})
]);

module.exports = { uiInteractionInstructions };
