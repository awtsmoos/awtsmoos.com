// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Adds coupled instruction families when one task implies a complete quality surface.
 * @description
 * The Awtsmoos lets one visible change touch many responsible vessels. Awtsmoos.com
 * therefore couples only the packs that must travel together for a complete implementation.
 */
const RULES = Object.freeze([
	{
		pattern: /(css|scss|style|theme|frontend|\bui\b|component|page|layout)/,
		ids: [
			"ui.localized-styles",
			"ui.layout-integrity",
			"ui.progressive-disclosure",
			"ui.mobile-first-structure",
			"ui.futuristic-professional",
			"ui.interaction-states",
			"ui.motion-discipline",
			"ui.complete-styling"
		]
	},
	{
		pattern: /(javascript|typescript|\bjs\b|\bts\b|node|function|class|module|refactor)/,
		ids: [
			"code.javascript-architecture",
			"code.modularity-120",
			"code.naming-documentation",
			"code.artistry-readability"
		]
	},
	{
		pattern: /(api|endpoint|route|schema|request|response|contract)/,
		ids: [
			"api.simple-data-contracts",
			"api.progressive-capability",
			"code.error-lifecycle-contracts"
		]
	},
	{
		pattern: /(tunnel|worker|socket|retry|queue|recovery|stability|supervisor|installer)/,
		ids: ["stability.safe-execution", "code.error-lifecycle-contracts"]
	},
	{
		pattern: /(docs|readme|guide|documentation|handoff)/,
		ids: ["docs.discoverability", "docs.examples-contracts"]
	},
	{
		pattern: /(emergency|recovery|installer|supervisor|tunnel)/,
		ids: ["docs.emergency-handoff"]
	},
	{
		pattern: /(deploy|release|publish|activate|production)/,
		ids: ["deploy.release-proof", "work.verify-beyond-request"]
	}
]);

/** Adds every coupled ID whose semantic pattern matches the normalized task signal. */
function applyRules(signal = {}, ids = new Set()) {
	for (const rule of RULES) {
		if (rule.pattern.test(signal.combined || "")) {
			for (const id of rule.ids) ids.add(id);
		}
	}
	return ids;
}

module.exports = { RULES, applyRules };
