// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file Frontend system mapping and DOM/CSS contract doctrine.
 * @description The Awtsmoos reveals one interface through many vessels; Awtsmoos.com maps DOM,
 * state, style, events, data, and loading before change so hidden contracts are not broken by haste.
 */
const frontendSystemInstructions = Object.freeze([
	instructionPack({
		id: "frontend.system-map",
		version: 2,
		summary: "Map complete frontend ownership and runtime flow before editing a component.",
		tags: ["frontend", "ui", "dom", "component", "architecture", "ownership"],
		applies: {
			pathHints: ["/frontend/", "/components/", "/views/", "/pages/", "/ui/", "/apps/tunnel-control/"],
			taskHints: ["frontend", "component", "page", "widget", "header", "menu", "dialog", "drawer", "modal", "toolbar"]
		},
		instructions: [
			"Before editing, identify every file that creates the component DOM, styles it, mutates state, injects assets, subscribes to events, or controls loading.",
			"Build a compact ownership map: DOM producer, state owner, style owner, event owner, data source, asset owner, and deployment/public path. Do not invent a second owner when one already exists.",
			"Trace initial HTML or server shell through client initialization to interactive state. Record what exists before JavaScript, what appears after JavaScript, and what can fail between those states.",
			"Find duplicate implementations, stale variants, fallback markup, shadow DOM, portals, injected fragments, feature flags, and conditional branches before deciding where a fix belongs.",
			"Treat layout, styling, accessibility, interaction, data state, and loading state as one user-visible system. A local visual fix that breaks another state is incomplete.",
			"Identify canonical sources of truth for structure, state, style tokens, responsive rules, and public behavior before writing."
		]
	}),
	instructionPack({
		id: "frontend.dom-css-contracts",
		version: 2,
		summary: "Keep emitted classes, selectors, data attributes, ARIA state, and behavior synchronized.",
		tags: ["frontend", "dom", "css", "selectors", "attributes", "contracts"],
		applies: {
			taskHints: ["class", "selector", "data-state", "aria", "dom", "css", "toggle", "state attribute", "stylesheet"]
		},
		instructions: [
			"Never emit a required presentation class from HTML or JavaScript without proving that a matching rule exists in a stylesheet the page actually loads. An unstyled required class is a defect.",
			"Whenever JavaScript and CSS communicate through classes, data attributes, custom properties, or ARIA state, grep both sides and verify exact names and values still agree.",
			"If CSS expects [data-state=offline], JavaScript must set exactly that contract. Do not tolerate near-miss aliases that silently make selectors dead.",
			"When renaming a class or attribute, search templates, renderers, event delegation, tests, analytics hooks, stylesheets, and documentation before removal.",
			"Prefer JavaScript expressing semantic state while CSS expresses presentation from that state; avoid styling-only JS mutations when a state contract is clearer.",
			"Delete dead selectors and dead emitted classes after proving they have no runtime producer or consumer. Do not preserve contradictory contracts just in case."
		]
	})
]);

module.exports = { frontendSystemInstructions };
