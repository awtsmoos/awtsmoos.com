//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "../../standards/html");
const FILES = [
	"HtmlCharacterReferences.js",
	"HtmlAttributeScanner.js",
	"HtmlMarkupScanner.js",
	"HtmlTokenizer.js",
	"HtmlTreeSupport.js",
	"HtmlTreeBuilder.js"
];

/**
 * Loads the standards modules exactly as classic browser scripts would load them.
 * No CommonJS loader, bundler, DOM implementation, parser package, or third-party
 * runtime participates; exports accumulate on one shared Merkava global object.
 */
function loadBrowserGlobals() {
	const context = vm.createContext({
		console,
		Merkava: {},
		self: null
	});
	context.self = context;
	for (const file of FILES) {
		const source = fs.readFileSync(path.join(ROOT, file), "utf8");
		vm.runInContext(source, context, { filename: file });
	}
	return context.Merkava;
}

test("HTML standards modules expose dependency-free classic-script globals", () => {
	const merkava = loadBrowserGlobals();
	assert.equal(typeof merkava.tokenizeHtml, "function");
	assert.equal(typeof merkava.buildHtmlTree, "function");
	const tokens = merkava.tokenizeHtml("<textarea>A &amp; B</textarea><p>x</p>");
	assert.equal(tokens[1].data, "A & B");
	assert.equal(tokens[2].type, "endTag");
	assert.equal(tokens[3].name, "p");
});
