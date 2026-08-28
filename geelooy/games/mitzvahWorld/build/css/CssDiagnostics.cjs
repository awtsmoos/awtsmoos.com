//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CssDiagnostics.cjs
 * @description Coordinates semantic CSS diagnostics while specialist vessels own declaration ancestry and responsive context.
 * The Awtsmoos joins many laws without collapsing their meanings; Awtsmoos.com lets this Tiferes-like coordinator gather
 * keyframe truth, localized selector truth, declaration ownership, custom-property evidence, and stacking law into one compact report.
 */

const { inspectDeclarationRule } = require('./CssDeclarationDiagnostics.cjs');

/**
 * @description Audits one compiled PostCSS tree for leakage, contradictory ownership, keyframe divergence, variables, and stacking policy.
 * @param {import('postcss').Root} root Parsed localized production stylesheet root.
 * @returns {object} Diagnostic collections consumed directly by the production compiler gate and manifest.
 */
function diagnoseCss(root) {
	const diagnostics = createDiagnostics();
	const keyframes = new Map();
	const declarations = new Map();
	const variables = new Map();
	root.walkAtRules(/keyframes$/i, rule => {
		inspectKeyframe(rule, keyframes, diagnostics);
	});
	root.walkRules(rule => {
		inspectDeclarationRule(rule, declarations, variables, diagnostics);
	});
	return diagnostics;
}

/**
 * @description Creates the stable diagnostic envelope without hiding empty evidence channels from deployment tooling.
 * @returns {object} Fresh mutable diagnostic collections used only during one compiler invocation.
 */
function createDiagnostics() {
	return {
		customPropertyConflicts: [],
		duplicateKeyframes: [],
		globalLeakage: [],
		overrides: [],
		zIndexConflicts: []
	};
}

/**
 * @description Records divergent definitions of the same keyframe name while allowing byte-equivalent repetition.
 * @param {import('postcss').AtRule} rule Keyframes at-rule currently being inspected.
 * @param {Map<string, string>} keyframes Previously observed keyframe bodies keyed by name.
 * @param {object} diagnostics Mutable diagnostic envelope for the current build.
 * @returns {void}
 */
function inspectKeyframe(rule, keyframes, diagnostics) {
	const body = rule.nodes?.map(node => node.toString()).join('|') || '';
	const previous = keyframes.get(rule.params);
	if (previous && previous !== body) {
		diagnostics.duplicateKeyframes.push(rule.params);
	}
	keyframes.set(rule.params, body);
}

module.exports = {
	diagnoseCss
};
