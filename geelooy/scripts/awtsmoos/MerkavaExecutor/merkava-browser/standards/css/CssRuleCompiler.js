//B"H
//Boruch Hashem
//Blessed be He

{
const { parseCssDeclarations } = (typeof module === "object" && module.exports ? require("./CssDeclarationParser.js") : globalThis.Merkava);
const { parseCssRules } = (typeof module === "object" && module.exports ? require("./CssRuleParser.js") : globalThis.Merkava);
const { splitSelectorList } = (typeof module === "object" && module.exports ? require("./CssSelectorList.js") : globalThis.Merkava);
const { cssSpecificity } = (typeof module === "object" && module.exports ? require("./CssSpecificity.js") : globalThis.Merkava);
const conditions = (typeof module === "object" && module.exports ? require("./CssConditionEvaluator.js") : globalThis.Merkava);

/** Compiles parsed CSS into immutable author rules with deterministic source order. */
function compileCssStyleSheet(source, environment = {}, orderStart = 0) {
	const state = { environment, order: orderStart, rules: [], atRules: [] };
	compileRuleList(parseCssRules(source), state);
	return Object.freeze({
		atRules: Object.freeze(state.atRules),
		nextOrder: state.order,
		rules: Object.freeze(state.rules)
	});
}

function compileRuleList(parsedRules, state) {
	for (const rule of parsedRules) {
		if (rule.kind === "qualified") {
			compileQualifiedRule(rule, state);
			continue;
		}
		compileAtRule(rule, state);
	}
}

function compileQualifiedRule(rule, state) {
	const declarations = Object.freeze(parseCssDeclarations(rule.block));
	for (const selector of splitSelectorList(rule.prelude)) {
		state.rules.push(Object.freeze({
			declarations,
			order: state.order,
			selector,
			specificity: Object.freeze([0, ...cssSpecificity(selector)])
		}));
		state.order += 1;
	}
}

function compileAtRule(rule, state) {
	state.atRules.push(rule);
	if (!rule.block) return;
	if (rule.name === "layer") {
		compileRuleList(parseCssRules(rule.block), state);
		return;
	}
	if (rule.name === "media" && conditions.matchesMediaQuery(rule.prelude, state.environment)) {
		compileRuleList(parseCssRules(rule.block), state);
		return;
	}
	if (rule.name === "supports" && conditions.matchesSupportsCondition(rule.prelude, state.environment)) {
		compileRuleList(parseCssRules(rule.block), state);
	}
}

/** Compiles a programmatically added declaration object into cascade entries. */
function declarationsFromObject(declarations) {
	return Object.freeze(Object.entries(declarations || {}).map(([name, value]) => Object.freeze({
		important: false,
		name: String(name).toLowerCase(),
		value: String(value)
	})));
}

const AwtsExports = { compileCssStyleSheet, declarationsFromObject };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
