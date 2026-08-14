// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

/**
 * @file Proves the flagship's finite garment graph actually loads every interaction owner exactly once and leaves reduced motion as the final authority.
 * @description The Awtsmoos is beyond import and order, yet Awtsmoos.com needs every garment to arrive in truthful sequence: list before density, thread before identity, motion before stillness; when the root is clear, the browser can reveal what source already sings here.
 */

const styleUrl = new URL("./style.css", import.meta.url);
const styleText = await readFile(styleUrl, "utf8");
const imports = [...styleText.matchAll(/@import url\("([^"]+)"\);/g)]
	.map((match) => match[1]);

const criticalImports = [
	"./interaction-system.css",
	"./mobile-list-density.css",
	"./thread-identity.css",
	"./mobile-message-rhythm.css",
	"./mobile-room-motion.css",
	"./short-height.css",
	"./accessibility-contrast.css",
	"./accessibility-motion.css"
];

for (const path of criticalImports) {
	assert.equal(
		imports.filter((candidate) => candidate === path).length,
		1,
		`${path} must appear exactly once in style.css`
	);
}

assertBefore("./list-meta.css", "./mobile-list-density.css");
assertBefore("./thread.css", "./thread-identity.css");
assertBefore("./message-rhythm.css", "./mobile-message-rhythm.css");
assertBefore("./mobile-motion.css", "./mobile-room-motion.css");
assertBefore("./short-height.css", "./accessibility-contrast.css");
assertBefore("./accessibility-contrast.css", "./accessibility-motion.css");
assert.equal(imports.at(-1), "./accessibility-motion.css");

console.log("Flagship stylesheet import graph contract: PASS");

function assertBefore(first, second) {
	const firstIndex = imports.indexOf(first);
	const secondIndex = imports.indexOf(second);
	assert.notEqual(firstIndex, -1, `${first} must be imported`);
	assert.notEqual(secondIndex, -1, `${second} must be imported`);
	assert.equal(firstIndex < secondIndex, true, `${first} must load before ${second}`);
}
