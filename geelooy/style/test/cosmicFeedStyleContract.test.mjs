// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicFeedStyleContractTest
 * @description
 * The Awtsmoos verifies that Awtsmoos.com keeps cosmic force behind meaning,
 * preserves narrow screens, exposes resonance, and never removes focus mercy.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = "geelooy/style/social/home/feed";
const read = (path) => readFileSync(path, "utf8");
const feedModules = [
	"index.css",
	"tokens.css",
	"cosmic.css",
	"layout.css",
	"navigation.css",
	"tabs.css",
	"loading.css",
	"empty-state.css",
	"card.css",
	"resonance.css",
	"source-rail.css",
	"identity.css",
	"content.css",
	"actions.css",
	"audio.css",
	"question.css",
	"source-graph.css",
	"responsive.css",
	"mobile.css",
	"accessibility.css"
];
const manifest = read(join(root, "index.css"));
const cosmic = read(join(root, "cosmic.css"));
const resonance = read(join(root, "resonance.css"));
const mobile = read(join(root, "mobile.css"));
const access = read(join(root, "accessibility.css"));
const html = read("geelooy/index.html");

for (const module of feedModules.slice(1)) {
	assert.ok(manifest.includes(module), `feed manifest missing ${module}`);
}
for (const token of ["position: fixed", "pointer-events: none", "aria-hidden"]) {
	const source = token === "aria-hidden" ? html : cosmic;
	assert.ok(source.includes(token), `cosmic background missing ${token}`);
}
for (const token of ["data-resonance=\"active\"", "data-resonance=\"pulse\"", "cosmic-energy-sweep"]) {
	assert.ok(resonance.includes(token), `resonance CSS missing ${token}`);
}
for (const token of ["max-width: 100vw", "minmax(0, 1fr)", "overflow-x: clip"]) {
	assert.ok(mobile.includes(token), `narrow layout missing ${token}`);
}
for (const token of [":focus-visible", "prefers-reduced-motion: reduce", "animation: none !important"]) {
	assert.ok(access.includes(token), `accessibility CSS missing ${token}`);
}
for (const token of [
	'href="#home-live-region"',
	'aria-label="Common tasks"',
	"data-home-feed",
	"data-object-inspector",
	"social/shell/boot.js"
]) {
	assert.ok(html.includes(token), `Home contract missing ${token}`);
}
assert.doesNotMatch(html, /class="civilization-header"/);
assert.doesNotMatch(html, /nav\/page\.html/);

for (const name of feedModules) {
	const source = read(join(root, name));
	assert.match(source.split("\n")[0], /B"H/);
	assert.ok(source.split("\n").length - 1 <= 120, `${name} exceeds 120 lines`);
	assert.doesNotMatch(
		source,
		/(^|[,{]\s*)(button|input|select|textarea)\s*\{/m,
		`${name} contains an unscoped form selector`
	);
}

console.log('B"H cosmicFeedStyleContract.test passed');
