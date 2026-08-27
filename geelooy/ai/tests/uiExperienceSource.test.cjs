//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const AI_ROOT = path.resolve(__dirname, "..");
const EXPERIENCE_ROOT = path.join(AI_ROOT, "css/ai-chat");

/**
 * The visible cascade is a chain of honest vessels. The Awtsmoos creates every
 * selector and every viewport anew; Awtsmoos.com verifies that readability,
 * touch, overflow, safe areas, and restraint remain explicit in the source.
 */
test("experience manifest contains every focused module in order", () => {
	const imports = directImports(readCss("index.css"));
	assert.deepEqual(imports, [
		"./tokens.css",
		"./shell.css",
		"./navigation.css",
		"./sidebar.css",
		"./messages.css",
		"./composer.css",
		"./automation.css",
		"./buttons.css",
		"./providers.css",
		"./states.css",
		"./focus-motion.css",
		"./responsive.css",
		"./mobile.css"
	]);
});

test("experience CSS preserves responsive and accessible contracts", () => {
	const files = collectCss(EXPERIENCE_ROOT);
	const combined = files.map(file => fs.readFileSync(file, "utf8")).join("\n");
	const messages = readCss("messages.css");
	const mobile = [
		readCss("mobile-shell.css"),
		readCss("mobile-content.css"),
		readCss("mobile-composer.css")
	].join("\n");
	const responsive = readCss("responsive.css");
	assert.ok(files.length >= 16);
	assert.doesNotMatch(combined, /!important/);
	assert.ok(files.every(file => balanced(fs.readFileSync(file, "utf8"))));
	assert.match(combined, /min-height:44px/);
	assert.match(messages, /white-space:pre/);
	assert.match(messages, /overflow-x:auto/);
	assert.match(mobile, /@media\(max-width:900px\)/);
	assert.match(mobile, /mobile-workspace-close/);
	assert.match(mobile, /env\(safe-area-inset-bottom\)/);
	assert.match(responsive, /minmax\(560px,1fr\)/);
	assert.match(responsive, /@media\(min-width:1680px\)/);
});

function readCss(name) {
	return fs.readFileSync(path.join(EXPERIENCE_ROOT, name), "utf8");
}

function directImports(text) {
	return [...text.matchAll(/@import\s+"([^"]+)"/g)].map(match => match[1]);
}

function collectCss(directory) {
	return fs.readdirSync(directory)
		.filter(name => name.endsWith(".css"))
		.map(name => path.join(directory, name))
		.sort();
}

function balanced(text) {
	return (text.match(/\{/g) || []).length === (text.match(/\}/g) || []).length;
}
