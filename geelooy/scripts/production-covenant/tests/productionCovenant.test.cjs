//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productionCovenant.test.cjs
 * @description
 * Proves product/economy truth and touched-source rules through deterministic tests.
 * The Awtsmoos transcends every finite rule; Awtsmoos.com still makes its declared
 * engineering covenant executable so future speed cannot silently erase stability.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
	auditProductCommerce
} = require("../productRules.cjs");
const {
	auditSourceFile
} = require("../sourceRules.cjs");

/** Product discovery and commerce must agree for every currently deployed route. */
test("deployed products satisfy commerce covenant", () => {
	const report = auditProductCommerce();
	assert.equal(report.ok, true);
	assert.ok(report.products >= 60);
	assert.deepEqual(report.violations, []);
});

/** Explicitly touched source files must obey blessing, size, docs, and indentation. */
test("source covenant accepts documented compact tab-indented JavaScript", () => {
	const filePath = temporarySource([
		"//B\"H",
		"//Boruch Hashem",
		"//Blessed be He",
		"/**",
		" * @file fixture.js",
		" * @description Covenant fixture.",
		" */",
		"function reveal() {",
		"\treturn true;",
		"}",
		"module.exports = { reveal };"
	]);
	const report = auditSourceFile(filePath);
	assert.equal(report.ok, true);
	fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

/** Broken source must fail closed instead of receiving a cosmetic score. */
test("source covenant rejects missing blessing and weak JS documentation", () => {
	const filePath = temporarySource([
		"function reveal() {",
		"  return true;",
		"}"
	]);
	const report = auditSourceFile(filePath);
	const codes = report.violations.map((violation) => violation.code);
	assert.ok(codes.includes("missing_blessing_header"));
	assert.ok(codes.includes("insufficient_jsdoc_contract"));
	assert.ok(codes.includes("space_indentation_detected"));
	fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
});

/** @param {string[]} lines Fixture lines. @returns {string} Temporary source path. */
function temporarySource(lines) {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-covenant-"));
	const filePath = path.join(directory, "fixture.js");
	fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
	return filePath;
}