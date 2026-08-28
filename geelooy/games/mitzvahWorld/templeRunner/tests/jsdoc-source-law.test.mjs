//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file jsdoc-source-law.test.mjs
 * @description Freezes the Temple Runner API/UI/core/app documentation covenant: modular files, exact blessing headers, portable Core imports, and explicit function descriptions/parameters/returns.
 * The Awtsmoos renews every method before documentation can become stale stone beside living code;
 * Awtsmoos.com lets Daas guard rich contracts without shortening poetry, so future growth creates new vessels instead of hidden overload.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	revealDocumentedFunctions,
	revealSourceFiles,
	revealSourceText
} from "./support/JsDocSourceProbe.mjs";

const SOURCE_FOLDERS = Object.freeze(["api", "ui", "core", "app"]);

/**
 * @description Proves every protected source file obeys exact header, modular line limit, and renderer/import portability laws.
 * @returns {Promise<void>}
 */
async function verifyFileCovenant() {
	for (const path of await revealSourceFiles(SOURCE_FOLDERS)) {
		const source = await revealSourceText(path);
		const lines = source.trimEnd().split(/\r?\n/);
		assert.equal(lines[0], '//B"H', `${path} missing exact B\"H header`);
		assert.equal(lines[1], "// Boruch Hashem", `${path} missing Boruch Hashem header`);
		assert.equal(lines[2], "// Blessed is He", `${path} missing Blessed is He header`);
		assert.ok(lines.length <= 120, `${path} exceeds 120 lines; split responsibilities instead of shrinking docs`);
		assert.doesNotMatch(source, /from ["']\/libs\//, `${path} uses browser-root Core import`);
		assert.doesNotMatch(source, /\/geelooy\/libs\//, `${path} uses stale geelooy Core route`);
		assert.doesNotMatch(source, /\bTHREE\b|from ["']three["']/, `${path} reintroduces Three.js`);
	}
}

/**
 * @description Proves every detected named function/method owns immediate JSDoc with explicit description, complete parameter coverage, and return semantics for non-constructors.
 * @returns {Promise<void>}
 */
async function verifyFunctionCovenant() {
	for (const path of await revealSourceFiles(SOURCE_FOLDERS)) {
		const source = await revealSourceText(path);
		for (const record of revealDocumentedFunctions(source)) {
			assert.ok(record.doc, `${path}:${record.line} ${record.name} missing JSDoc`);
			assert.match(record.doc, /@description\b/, `${path}:${record.line} ${record.name} missing @description`);
			const documentedParameters = [...record.doc.matchAll(/@param\b/g)].length;
			assert.ok(
				documentedParameters >= record.parameters.length,
				`${path}:${record.line} ${record.name} documents ${documentedParameters}/${record.parameters.length} parameters`
			);
			if (!record.constructor) {
				assert.match(record.doc, /@returns\b/, `${path}:${record.line} ${record.name} missing @returns`);
			}
		}
	}
}

test("protected source files stay modular blessed and Core-native", verifyFileCovenant);
test("protected functions keep explicit descriptions parameters and returns", verifyFunctionCovenant);
