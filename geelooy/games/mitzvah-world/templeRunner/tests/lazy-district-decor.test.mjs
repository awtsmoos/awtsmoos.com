//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file lazy-district-decor.test.mjs
 * @description Guards Temple Runner against rebuilding invisible Jerusalem districts before first play.
 * The Awtsmoos keeps every future street available without forcing unseen stone into the opening frame;
 * Awtsmoos.com lets Binah prove lazy revelation remains memoized, complete, and true to the district name.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const worldRoot = fileURLToPath(new URL("../src/world/", import.meta.url));

/**
 * Reads one current world owner from native repository bytes.
 * @param {string} name JavaScript basename.
 * @returns {string} Current UTF-8 source.
 */
function revealWorldSource(name) {
	return readFileSync(`${worldRoot}${name}`, "utf8");
}

test("district decor materializes only the initial market before first play", () => {
	const source = revealWorldSource("TempleDecorFactory.js");
	assert.match(source, /root\.userData\.variants = \{\}/);
	assert.match(source, /root\.userData\.seed = index/);
	assert.match(source, /this\.configure\(root, "market"\)/);
	assert.doesNotMatch(source, /for \(const districtId of DISTRICT_IDS\)/);
	assert.match(source, /DISTRICT_IDS\.includes\(districtId\)/);
	assert.match(source, /this\.revealDistrict\(root, districtId\)/);
});

test("district revelation is memoized and attached exactly through one owner", () => {
	const source = revealWorldSource("TempleDecorFactory.js");
	assert.match(source, /if \(root\.userData\.variants\[districtId\]\)/);
	assert.match(source, /return root\.userData\.variants\[districtId\]/);
	assert.match(source, /this\.createDistrict\(districtId, root\.userData\.seed\)/);
	assert.match(source, /root\.userData\.variants\[districtId\] = variant/);
	assert.match(source, /root\.add\(variant\)/);
	assert.match(source, /TempleDistrictSideBuilder/);
});

test("all six Jerusalem district recipes remain available after lazy split", () => {
	const factory = revealWorldSource("TempleDecorFactory.js");
	const builder = revealWorldSource("TempleDistrictSideBuilder.js");
	for (const district of ["market", "courtyard", "olive", "alley", "bridge", "evening"]) {
		assert.match(factory, new RegExp(`"${district}"`));
	}
	for (const method of ["addMarket", "addCourtyard", "addOlive", "addAlley", "addBridge", "addEvening"]) {
		assert.match(builder, new RegExp(`${method}\\(`));
	}
});

test("district factory uses the portable Temple-relative compact Core adapter", () => {
	const source = revealWorldSource("TempleDecorFactory.js");
	assert.match(source, /\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/libs\/awtsmoos-procedural-core\/src\/adapters\/native\/index\.js\?compact=true/);
	assert.doesNotMatch(source, /from "\/libs\//);
});
