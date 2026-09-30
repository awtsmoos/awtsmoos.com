// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file Automated integrity and browser visual verification doctrine.
 * @description The Awtsmoos asks for evidence rather than assumption; Awtsmoos.com scripts contracts
 * and looks at the cold-rendered interface before calling a frontend repair complete.
 */
const frontendVerificationInstructions = Object.freeze([
	instructionPack({
		id: "frontend.automated-integrity",
		version: 1,
		summary: "Script DOM/style/asset/ARIA/layering integrity checks instead of trusting eyeballing.",
		tags: ["frontend", "verification", "automation", "css", "dom", "assets"],
		applies: { taskHints: ["frontend", "css", "class", "selector", "asset", "z-index", "tap target", "integrity", "orphan"] },
		instructions: [
			"Extract classes emitted by relevant HTML/templates/JavaScript and compare them with selectors from stylesheets the page actually loads. Required presentation classes without loaded matching rules fail.",
			"Resolve every @import, stylesheet link, script/module, image, icon, font, worker, and feature asset reference. Existence alone is insufficient: prove the page/build actually loads it.",
			"Scan feature directories for orphan CSS, JavaScript, images, fonts, and motion files. Every deliberate artifact needs a consumer or documented entry-point role.",
			"Audit z-index declarations. Prefer named layer/token scales; flag unexplained raw stacking numbers and inspect the stacking context that gives each number meaning.",
			"Measure actual hit boxes for buttons, links acting as controls, switches, menu items, icon buttons, and other touch targets; targets smaller than 44px by 44px require correction or a documented exception.",
			"Cross-check data attributes, ARIA attributes, IDs, label-for, aria-controls, aria-labelledby, aria-describedby, fragment targets, and event-delegation selectors so references resolve to the intended runtime element/state.",
			"Check duplicate IDs, broken local fragments, missing imports, browser console errors, failed critical network requests, and uncaught promise failures on exercised flows.",
			"Automate repeatable contract checks when the repository has enough structure. Prefer a regression test/script over a one-time manual scan."
		]
	}),
	instructionPack({
		id: "frontend.visual-verification",
		version: 1,
		summary: "Prove first paint, responsive layout, interactions, and visual states in a real browser when available.",
		tags: ["frontend", "visual", "browser", "cold-load", "screenshots"],
		applies: { taskHints: ["frontend", "ui", "visual", "mobile", "cold load", "screenshot", "render", "interaction"] },
		instructions: [
			"Use a cold load with cache bypassed when practical, not only a warmed tab. Observe before, during, and after initialization so transient defects are visible.",
			"Verify 390px phone width plus representative tablet and desktop widths; add narrower or wider cases when component constraints demand them.",
			"Inspect overlap, clipping, truncation, page-level horizontal scroll, layout jumps, unstyled flashes, invisible focus, tiny targets, stuck loading states, and overlays painting in the wrong layer.",
			"Exercise real interactions: click/tap, keyboard-only operation, open/close cycles, disabled/pending/error/success states, outside click and Escape where relevant, and repeated use.",
			"Capture before/after screenshots or equivalent browser evidence when it helps compare a visual defect objectively. Screenshots do not replace interaction or semantic checks.",
			"When production is accessible, compare served behavior/assets with repository intent. If live still differs, the task is not deployed even if local rendering is correct.",
			"If browser rendering is unavailable, state exactly which visual checks were not performed. Never substitute should-be-fine language."
		]
	})
]);

module.exports = { frontendVerificationInstructions };
