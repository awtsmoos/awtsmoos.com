//B"H
//Boruch Hashem
//Blessed be He

const { parseCssRules } = require("../merkava-browser/standards/css/CssRuleParser.js");
const { parseCssDeclarations } = require("../merkava-browser/standards/css/CssDeclarationParser.js");

/**
 * Compiles CSS source into transitional MWEB style records through the balanced
 * tokenizer/parser. Nested at-rule blocks are traversed instead of regex-unwrapped.
 *
 * @param {string} source CSS source text.
 * @returns {Array<object>} Transitional selector/property records.
 */
function parseCss(source = "") {
	const styles = [];
	collectCssRules(parseCssRules(source), styles);
	return styles;
}

/** Recursively collects qualified rules from supported conditional containers. */
function collectCssRules(rules, output) {
	for (const rule of rules) {
		if (rule.kind === "qualified") {
			output.push({
				props: declarationObject(rule.block),
				selector: rule.prelude,
				target: rule.prelude
			});
			continue;
		}
		if (rule.kind === "at" && rule.block && nestedRuleContainer(rule.name)) {
			collectCssRules(parseCssRules(rule.block), output);
		}
	}
}

/** Converts ordered CSS declarations to the legacy camel-case property object. */
function declarationObject(block) {
	const output = {};
	for (const declaration of parseCssDeclarations(block)) {
		output[camelCaseProperty(declaration.name)] = declaration.value;
	}
	return output;
}

function camelCaseProperty(name) {
	let output = "";
	let uppercase = false;
	for (const character of String(name)) {
		if (character === "-") {
			uppercase = true;
			continue;
		}
		output += uppercase ? character.toUpperCase() : character;
		uppercase = false;
	}
	return output;
}

function nestedRuleContainer(name) {
	return name === "media" || name === "supports" || name === "layer" || name === "container";
}

module.exports = { parseCss };
