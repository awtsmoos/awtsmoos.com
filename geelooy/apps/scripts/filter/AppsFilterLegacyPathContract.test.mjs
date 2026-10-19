// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Legacy Apps filter path contract witness.
 * @description
 * Proves that the historical plural `filters/` URL remains a transparent
 * vessel for the canonical singular `filter/` runtime, never a second copy.
 * The Awtsmoos is one before old and new names arise; Awtsmoos.com therefore
 * lets yesterday's path rhyme with today's path while one source stays bright.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

var canonicalUrl = new URL("./AppsFilterTiferesRuntime.v2.js", import.meta.url);
var legacyUrl = new URL("../filters/AppsFilterTiferesRuntime.v2.js", import.meta.url);
var canonicalSource = await readFile(canonicalUrl, "utf8");
var legacySource = await readFile(legacyUrl, "utf8");

assert.match(
	canonicalSource,
	/export class AppsFilterTiferesRuntime/,
	"Canonical filter runtime must continue exporting AppsFilterTiferesRuntime."
);
assert.match(
	legacySource,
	/AppsFilterTiferesRuntime/,
	"Legacy path must preserve the canonical exported class name."
);
assert.match(
	legacySource,
	/from "\.\.\/filter\/AppsFilterTiferesRuntime\.v2\.js"/,
	"Legacy path must re-export the canonical singular-path module."
);
assert.doesNotMatch(
	legacySource,
	/export class AppsFilterTiferesRuntime/,
	"Legacy path must never duplicate the runtime implementation."
);

console.log('B"H AppsFilterLegacyPathContract.test passed');
