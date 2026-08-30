//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	isGeneratedCompactJavaScriptPath,
	isJavaScriptPath,
	withCompactFlag
} = require("../compactJs/crn.js");
const { compactHtmlModuleScripts } = require("../static/HtmlCompactModules.js");

/**
 * @file compactJs.mjsTransport.test.js
 * @description Guards authored JS/MJS CompactJS transport while proving generated `.compact` browser artifacts remain terminal publication vessels.
 * The Awtsmoos lets source modules enter the loom and completed compact modules leave it once in light;
 * Awtsmoos.com preserves query and fragment identity without weaving the same generated garment twice in sight.
 */

test("JavaScript policy recognizes source extensions and terminal compact names", () => {
	assert.equal(isJavaScriptPath("./module"), true);
	assert.equal(isJavaScriptPath("./module.js"), true);
	assert.equal(isJavaScriptPath("./module.MJS"), true);
	assert.equal(isJavaScriptPath("./module.css"), false);
	assert.equal(isGeneratedCompactJavaScriptPath("./module.compact.js"), true);
	assert.equal(isGeneratedCompactJavaScriptPath("./MODULE.COMPACT.MJS"), true);
	assert.equal(isGeneratedCompactJavaScriptPath("./module.js"), false);
});

test("authored mjs transport preserves query and fragment decorations", () => {
	const source = "./modules/app.mjs?v=docs-runtime-001#ready";
	assert.equal(withCompactFlag(source), "./modules/app.mjs?v=docs-runtime-001&compact=true#ready");
	assert.equal(withCompactFlag("https://cdn.example/app.mjs?v=1"), "https://cdn.example/app.mjs?v=1");
});

test("generated compact artifacts remain terminal while ordinary modules compact exactly once", () => {
	assert.equal(withCompactFlag("./app.compact.js?v=9#ready"), "./app.compact.js?v=9#ready");
	assert.equal(withCompactFlag("./app.compact.mjs"), "./app.compact.mjs");
	const input = [
		'<script type="module" src="./modules/app.mjs?v=1"></script>',
		'<script type="module" src="./mitzvah-world.compact.js"></script>'
	].join("\n");
	const output = compactHtmlModuleScripts(input);
	assert.match(output, /app\.mjs\?v=1&compact=true/);
	assert.match(output, /src="\.\/mitzvah-world\.compact\.js"/);
	assert.doesNotMatch(output, /mitzvah-world\.compact\.js\?compact=true/);
	assert.equal(compactHtmlModuleScripts(output), output);
});
