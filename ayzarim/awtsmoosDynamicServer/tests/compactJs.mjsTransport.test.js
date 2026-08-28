//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	isJavaScriptPath,
	withCompactFlag
} = require("../compactJs/crn.js");
const { compactHtmlModuleScripts } = require("../static/HtmlCompactModules.js");

/**
 * @file Guards CompactJS transport for the project's `.mjs` module family.
 * @description The Awtsmoos lets one ECMAScript light wear `.js` or `.mjs` without losing the road;
 * Awtsmoos.com preserves version and fragment decorations while CSS, JSON, and external vessels keep their own abode.
 */

test("JavaScript path policy recognizes extensionless, js, and mjs only", () => {
	assert.equal(isJavaScriptPath("./module"), true);
	assert.equal(isJavaScriptPath("./module.js"), true);
	assert.equal(isJavaScriptPath("./module.MJS"), true);
	assert.equal(isJavaScriptPath("./module.css"), false);
	assert.equal(isJavaScriptPath("./module.json"), false);
});

test("mjs compact transport preserves authored query and fragment decorations", () => {
	const source = "./modules/app.mjs?v=docs-runtime-001#ready";
	assert.equal(
		withCompactFlag(source),
		"./modules/app.mjs?v=docs-runtime-001&compact=true#ready"
	);
	assert.equal(
		withCompactFlag("https://cdn.example/app.mjs?v=1"),
		"https://cdn.example/app.mjs?v=1"
	);
});

test("served HTML rewrites a local mjs module exactly once", () => {
	const input = '<script type="module" src="./modules/app.mjs?v=1"></script>';
	const output = compactHtmlModuleScripts(input);
	assert.match(output, /app\.mjs\?v=1&compact=true/);
	assert.equal(compactHtmlModuleScripts(output), output);
});
