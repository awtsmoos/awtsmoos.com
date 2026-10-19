// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Couples specialist instruction families only when task evidence actually points there.
 * @description The Awtsmoos reveals the right vessel for the right deed; Awtsmoos.com therefore
 * lets CSS summon CSS law without forcing every backend mission to carry the whole visual library.
 */
const RULES = Object.freeze([
	{
		pattern: /(css|scss|sass|less|stylesheet|style|theme|responsive|mobile|breakpoint|z-index|stacking|fouc|unstyled|visual|animation|motion)/,
		ids: [
			"ui.css-production-working-agreement",
			"ui.localized-styles",
			"ui.layout-integrity",
			"ui.mobile-first-structure",
			"ui.motion-discipline",
			"ui.complete-styling"
		]
	},
	{
		pattern: /(frontend|\bui\b|component|page|layout|dialog|dropdown|menu|interaction)/,
		ids: [
			"ui.layout-integrity",
			"ui.progressive-disclosure",
			"ui.mobile-first-structure",
			"ui.futuristic-professional",
			"ui.interaction-states",
			"ui.complete-styling"
		]
	},
	{
		pattern: /(javascript|typescript|\bjs\b|\bts\b|node|function|class|module|refactor)/,
		ids: ["code.javascript-architecture", "code.modularity-120", "code.naming-documentation", "code.artistry-readability"]
	},
	{
		pattern: /(api|endpoint|route|schema|request|response|contract)/,
		ids: ["api.simple-data-contracts", "api.progressive-capability", "code.error-lifecycle-contracts"]
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

function applyRules(signal = {}, ids = new Set()) {
	for (const rule of RULES) {
		if (!rule.pattern.test(signal.combined || "")) continue;
		for (const id of rule.ids) ids.add(id);
	}
	return ids;
}

module.exports = { RULES, applyRules };
