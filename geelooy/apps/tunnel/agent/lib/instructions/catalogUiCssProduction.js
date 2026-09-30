// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file Production UI/CSS working agreement discovered only when styling work actually needs it.
 * @description The Awtsmoos reveals order through a truthful cascade; Awtsmoos.com therefore
 * maps every visual vessel before change, removes conflict rather than layering patches,
 * and proves what real users see on a cold phone load before calling the work complete.
 */
const uiCssProductionInstructions = Object.freeze([
	instructionPack({
		id: "ui.css-production-working-agreement",
		version: 3,
		summary: "For production UI/CSS work, map the full cascade/load path, consolidate conflicts, verify cold mobile rendering, and prove assets actually ship.",
		tags: ["ui", "css", "frontend", "mobile", "responsive", "cascade", "visual", "production"],
		applies: {
			extensions: [".css", ".scss", ".sass", ".less"],
			pathHints: ["/styles/", "/css/", "stylesheet"],
			taskHints: ["css", "stylesheet", "style", "responsive", "mobile", "breakpoint", "z-index", "stacking", "fouc", "unstyled", "animation", "visual"]
		},
		instructions: [
			"Before editing, find every stylesheet, inline style, JavaScript-injected style, DOM builder, and asset that affects the component; report conflicting rules, dead/overridden rules, and specificity wars before fixing.",
			"Never layer another patch onto a broken cascade. Consolidate conflicting declarations toward one source of truth per property; delete dead rules instead of commenting them out or preserving them just in case.",
			"Reason about load order as well as final computed state. For JavaScript-injected styles, DOM, or widgets, inspect what users see before initialization and eliminate FOUC/hydration gaps with an appropriate ready-state, skeleton, or critical CSS strategy.",
			"After visual changes, render or screenshot at 390px plus representative tablet and desktop widths on a cold load with cache bypassed when the environment allows it. Inspect overlap, truncation, unstyled flashes, horizontal scrolling, and undersized targets.",
			"If the environment cannot render the page, state that explicitly in the verification report. Never replace missing visual evidence with should-be-fine language.",
			"Mobile controls need at least 44px tap targets with breathing room between adjacent targets. Keep UI text at 12px or larger, avoid fixed widths that can overflow 390px, and make long labels truncate or wrap intentionally without overlapping neighbors.",
			"Audit stacking contexts, not only z-index numbers. isolation, transform, opacity, filter, and similar properties can trap descendants; menus, dropdowns, and dialogs must paint intentionally above competing page layers such as toasts and banners.",
			"Animation work is incomplete until the relevant CSS/JS asset is actually referenced, loads successfully, and is present in the deployed/public build. Respect prefers-reduced-motion and preserve equivalent non-motion feedback.",
			"No orphan files or assets: every new CSS, JS, image, font, or motion file must be referenced; every reference must resolve and load. Flag missing and unlinked artifacts.",
			"When production/public inspection is available, diff repository intent against live behavior or served assets. A file written or committed in the repository is not evidence that users receive it.",
			"End UI/CSS work with four explicit facts: files changed and why; conflicts found and whether resolved; visual checks including widths/cold-load observations; and anything that could not be verified."
		]
	})
]);

module.exports = { uiCssProductionInstructions };
