//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const { tokenizeCss } = require("../../standards/css/CssSyntaxTokenizer.js");
const { parseCssRules } = require("../../standards/css/CssRuleParser.js");
const { parseCssDeclarations } = require("../../standards/css/CssDeclarationParser.js");

test("tokenizer preserves functions dimensions strings and offsets", () => {
	const source = 'a{width:calc(100% - 2rem);content:"a;b"}';
	const tokens = tokenizeCss(source);
	assert(tokens.some(item => item.type === "function" && item.value === "calc"));
	assert(tokens.some(item => item.type === "dimension" && item.unit === "rem"));
	assert(tokens.some(item => item.type === "string" && item.value === "a;b"));
	assert.equal(source.slice(tokens[0].start, tokens[0].end), "a");
});

test("rule parser balances nested blocks and preserves at-rules", () => {
	const source = '@media (width > 1px){a{color:red}} b{background:linear-gradient(red,blue)}';
	const rules = parseCssRules(source);
	assert.equal(rules.length, 2);
	assert.equal(rules[0].kind, "at");
	assert.equal(rules[0].name, "media");
	assert.equal(rules[0].block, "a{color:red}");
	assert.equal(rules[1].prelude, "b");
});

test("declarations retain nesting and important priority", () => {
	const source = 'background:url("data:x;a") center; color: rgb(1 2 3 / .5) !important; --x: a;b: c';
	const declarations = parseCssDeclarations(source);
	assert.equal(declarations[0].name, "background");
	assert.equal(declarations[0].value, 'url("data:x;a") center');
	assert.equal(declarations[1].important, true);
	assert.equal(declarations[1].value, "rgb(1 2 3 / .5)");
	assert.equal(declarations[2].name, "--x");
});

const { splitSelectorList, tokenizeSelectorSequence } = require("../../standards/css/CssSelectorList.js");
const { cssSpecificity } = require("../../standards/css/CssSpecificity.js");
const { matchesNth, parseNthExpression } = require("../../standards/css/CssNthExpression.js");

test("selector lists and combinators respect functional nesting", () => {
	assert.deepEqual(splitSelectorList("a:is(.x,.y), b"), ["a:is(.x,.y)", "b"]);
	assert.deepEqual(tokenizeSelectorSequence("main > .card + button"), ["main", ">", ".card", "+", "button"]);
	assert.deepEqual(tokenizeSelectorSequence("article .name"), ["article", " ", ".name"]);
});

test("specificity follows tuples and functional pseudo rules", () => {
	assert.deepEqual(cssSpecificity("#app .card button"), [1, 1, 1]);
	assert.deepEqual(cssSpecificity(":where(#x).card"), [0, 1, 0]);
	assert.deepEqual(cssSpecificity("article:is(.x,#winner)"), [1, 0, 1]);
	assert.deepEqual(cssSpecificity("li:nth-child(2n+1 of .chosen)"), [0, 2, 1]);
});

test("An+B parser handles positive negative odd and even forms", () => {
	assert.equal(matchesNth(5, parseNthExpression("2n+1")), true);
	assert.equal(matchesNth(4, parseNthExpression("2n+1")), false);
	assert.equal(matchesNth(3, parseNthExpression("-n+3")), true);
	assert.equal(matchesNth(4, parseNthExpression("-n+3")), false);
	assert.equal(matchesNth(6, parseNthExpression("even")), true);
});

const { matchesCssSelector } = require("../../standards/css/CssSelectorMatcher.js");

function element(tag, attributes = {}, children = []) {
	const node = {
		attributes: { ...attributes },
		checked: attributes.checked != null,
		children,
		classList: {
			contains(name) {
				return String(attributes.class || "").split(/\s+/).includes(name);
			}
		},
		disabled: attributes.disabled != null,
		getAttribute(name) {
			return this.attributes[name] ?? null;
		},
		hasAttribute(name) {
			return Object.prototype.hasOwnProperty.call(this.attributes, name);
		},
		id: attributes.id || "",
		localName: tag,
		nodeType: 1,
		parentNode: null
	};
	for (const child of children) child.parentNode = node;
	Object.defineProperty(node, "previousSibling", {
		get() {
			const siblings = this.parentNode?.children || [];
			return siblings[siblings.indexOf(this) - 1] || null;
		}
	});
	Object.defineProperty(node, "nextSibling", {
		get() {
			const siblings = this.parentNode?.children || [];
			return siblings[siblings.indexOf(this) + 1] || null;
		}
	});
	return node;
}

test("selector matcher covers combinators attributes and structural pseudos", () => {
	const first = element("li", { class: "item chosen", "data-x": "Alpha beta" });
	const second = element("li", { class: "item", "data-x": "beta" });
	const list = element("ul", { id: "menu" }, [first, second]);
	const main = element("main", {}, [list]);
	assert.equal(matchesCssSelector(first, "main > ul#menu > li.item:first-child"), true);
	assert.equal(matchesCssSelector(second, "li + li:last-child"), true);
	assert.equal(matchesCssSelector(first, '[data-x~="beta"]'), true);
	assert.equal(matchesCssSelector(first, '[data-x^="alpha" i]'), true);
	assert.equal(matchesCssSelector(first, "li:nth-child(2n+1)"), true);
	assert.equal(matchesCssSelector(list, "ul:has(> li.chosen)"), true);
	assert.equal(matchesCssSelector(main, "main:has(li:last-child)"), true);
});

const { cascadeCss } = require("../../standards/css/CssCascade.js");
const { compileCssStyleSheet } = require("../../standards/css/CssRuleCompiler.js");

test("cascade ranks important specificity source order and inheritance", () => {
	const child = element("button", { class: "action", id: "go" });
	const parent = element("div", {}, [child]);
	const compiled = compileCssStyleSheet(`
		button { color: blue; font-size: 12px; }
		#go { color: green; }
		.action { color: red !important; }
		#go { background: black; }
	`);
	const style = cascadeCss(child, compiled.rules, { color: "purple", "font-family": "Merkava" });
	assert.equal(style.color, "red");
	assert.equal(style.background, "black");
	assert.equal(style["font-family"], "Merkava");
	assert.equal(style["font-size"], "12px");
	assert.equal(parent.children[0], child);
});

test("conditional rules use explicit virtual environment capabilities", () => {
	const compiled = compileCssStyleSheet(`
		@media screen and (min-width: 800px) { .wide { width: 10px; } }
		@media print { .wide { width: 20px; } }
		@supports (display: grid) { .wide { display: grid; } }
	`, {
		height: 700,
		type: "screen",
		width: 1000,
		supports(name, value) {
			return name === "display" && value === "grid";
		}
	});
	const target = element("div", { class: "wide" });
	const style = cascadeCss(target, compiled.rules);
	assert.equal(style.width, "10px");
	assert.equal(style.display, "grid");
});
