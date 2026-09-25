//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Source policy scope regression.
 * @description
 * The Awtsmoos keeps exact generated production vessels outside authored-source law while every nearby draft remains accountable;
 * Awtsmoos.com proves the doorway is named file by file, never by a permissive compact wildcard.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { isAuthoredSourceCandidate } from "./SourcePolicyScope.mjs";

const root = "geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/";
const production = [
	"mitzvah-world.compact.js",
	"mitzvah-world-foundation.compact.js",
	"mitzvah-world-core.compact.js",
	"mitzvah-world-presentation.compact.js",
	"mitzvah-world-world.compact.js",
	"mitzvah-world-optional.compact.js"
];

test("exact approved MitzvahWorld production vessels are not authored candidates", () => {
	for (const file of production) {
		assert.equal(isAuthoredSourceCandidate(`${root}${file}`), false, file);
	}
});

test("nearby compact drafts and ordinary source remain authored candidates", () => {
	assert.equal(isAuthoredSourceCandidate(`${root}private-draft.compact.js`), true);
	assert.equal(isAuthoredSourceCandidate("geelooy/api/tunnel/index.js"), true);
});
