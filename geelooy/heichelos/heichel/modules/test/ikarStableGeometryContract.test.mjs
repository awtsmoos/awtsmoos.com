//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Ikar stable geometry contract.
 * @description
 * The Awtsmoos reveals usable Torah geometry before hydration while Awtsmoos.com
 * enhances the same navigation and search vessels instead of replacing them.
 */

import assert from "node:assert/strict";
import fs from "node:fs";

const fallbackPath = new URL("../../semantic/fallback.html", import.meta.url);
const stablePath = new URL("../../ikar-stable.js", import.meta.url);
const criticalPath = new URL("../../critical-boot.js", import.meta.url);
const enhancerPath = new URL("../../ikar-first.js", import.meta.url);
const searchPath = new URL("../../ikar-search.js", import.meta.url);
const fallback = fs.readFileSync(fallbackPath, "utf8");
const stable = fs.readFileSync(stablePath, "utf8");
const critical = fs.readFileSync(criticalPath, "utf8");
const enhancer = fs.readFileSync(enhancerPath, "utf8");
const search = fs.readFileSync(searchPath, "utf8");

assert.match(fallback, /var isIkarRoute = isIkarRoot \|\| path\.indexOf\("\/heichelos\/ikar\/"\) === 0/);
assert.match(fallback, /data-ikar-stable-search/);
assert.match(fallback, /data-ikar-stable-navigation/);
assert.match(fallback, /placeholder=\\"Type a title in Hebrew or English\\"/);
assert.doesNotMatch(fallback, /placeholder=\\"Type a title in Hebrew or English\\" disabled/);
assert.match(fallback, /Choose what to learn/);
assert.match(fallback, /Choose a section/);

assert.match(stable, /ikar-first\.js\?v=ikar-first-004&persistent-geometry=true/);
assert.match(stable, /bootIkarFirst\(\);/);
assert.doesNotMatch(stable, /\.remove\(\)/);
assert.doesNotMatch(stable, /querySelector\(/);

assert.match(critical, /ikar-stable\.js\?v=ikar-stable-001&compact=true/);
assert.match(enhancer, /installIkarSearch/);
assert.match(enhancer, /data-ikar-stable-navigation/);
assert.match(search, /data-ikar-stable-search/);
assert.match(search, /input\.dataset\.ikarSearchReady/);
assert.match(search, /input\.disabled = false/);
assert.match(search, /input\.addEventListener\('input', filter\)/);

for (const [name, source] of [
	["stable", stable],
	["enhancer", enhancer],
	["search", search],
	["critical", critical],
	["contract", fs.readFileSync(new URL(import.meta.url), "utf8")]
]) {
	assert.ok(source.split("\n").length <= 120, `${name} exceeds 120 lines`);
}

console.log('B"H Ikar persistent geometry contract: PASS');
