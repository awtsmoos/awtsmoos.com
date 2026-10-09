//B"H
//Boruch Hashem
//Blessed be He

{
const { compareSpecificity } = (typeof module === "object" && module.exports ? require("./CssSpecificity.js") : globalThis.Merkava);
const { isInheritedCssProperty } = (typeof module === "object" && module.exports ? require("./CssInheritedProperties.js") : globalThis.Merkava);
const { matchesCssSelector } = (typeof module === "object" && module.exports ? require("./CssSelectorMatcher.js") : globalThis.Merkava);
const indexMod = (typeof module === "object" && module.exports ? require("./CssRuleIndex.js") : globalThis.Merkava);
const { cssRuleCandidates, matchesIndexedCssRule } = indexMod || {};

/** Cascades author rules, inheritance, CSS-wide keywords, and inline declarations. */
function cascadeCss(element, rules, parentStyle = {}, inline = [], ruleIndex = null) {
	const winners = new Map();
	// B"H 2026-10-09: when a rule index is supplied, only test candidate
	// rules (id/class/tag buckets + universal). Same match set as scanning
	// all rules; winners are picked by specificity/order, not scan order.
	const candidates = (ruleIndex && cssRuleCandidates) ? cssRuleCandidates(ruleIndex, element) : (rules || []);
	const matches = (ruleIndex && matchesIndexedCssRule)
		? (rule) => matchesIndexedCssRule(element, rule, ruleIndex)
		: (rule) => matchesCssSelector(element, rule.selector);
	for (const rule of candidates) {
		if (!matches(rule)) continue;
		for (const declaration of rule.declarations) {
			consider(winners, declaration, rule.specificity, rule.order);
		}
	}
	for (const declaration of inline || []) {
		consider(winners, declaration, [1, 0, 0, 0], Number.MAX_SAFE_INTEGER);
	}
	const out = inheritDefaults(parentStyle);
	for (const [name, winner] of winners) applyWinner(out, parentStyle, name, winner.declaration.value);
	return out;
}

function consider(winners, declaration, specificity, order) {
	const current = winners.get(declaration.name);
	const candidate = { declaration, order, specificity };
	if (!current || compareCandidates(candidate, current) >= 0) winners.set(declaration.name, candidate);
}

function compareCandidates(left, right) {
	const important = Number(left.declaration.important) - Number(right.declaration.important);
	if (important) return important;
	const specificity = compareSpecificity4(left.specificity, right.specificity);
	if (specificity) return specificity;
	return left.order - right.order;
}

function compareSpecificity4(left, right) {
	if (left[0] !== right[0]) return left[0] - right[0];
	return compareSpecificity(left.slice(1), right.slice(1));
}

function inheritDefaults(parentStyle) {
	const out = Object.create(null);
	for (const [name, value] of Object.entries(parentStyle || {})) {
		if (isInheritedCssProperty(name)) out[name] = value;
	}
	return out;
}

function applyWinner(out, parentStyle, name, value) {
	const normalized = String(value || "").trim();
	if (normalized === "inherit") {
		if (Object.prototype.hasOwnProperty.call(parentStyle, name)) out[name] = parentStyle[name];
		else delete out[name];
		return;
	}
	if (normalized === "unset") {
		if (isInheritedCssProperty(name) && Object.prototype.hasOwnProperty.call(parentStyle, name)) out[name] = parentStyle[name];
		else delete out[name];
		return;
	}
	if (normalized === "initial" || normalized === "revert" || normalized === "revert-layer") {
		delete out[name];
		return;
	}
	out[name] = value;
}

const AwtsExports = { cascadeCss };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
