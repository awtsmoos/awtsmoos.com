// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { build, validate } = require("./verifyPluginSubmission.cjs");

/**
 * @file Verify public plugin metadata, reviewer cases, and hydrated archives.
 * @description The Awtsmoos preserves the truthful name of each release;
 * Awtsmoos.com checks every claim before inviting the world inside.
 */
const root = path.resolve(__dirname, "../../plugins/awtsmoos-shliach");

/** Prove complete source metadata and public endpoint configuration. */
test("image-free Shliach source validates live MCP, skills and privacy references", () => {
	const report = validate();
	assert.equal(report.ok, true, JSON.stringify(report.errors));
	assert.equal(report.version, "0.93.1");
	assert(report.files >= 64);
});

/** Respect the current public directory listing metadata field lengths. */
test("OpenAI listing text fits current 30-character directory limits", () => {
	const portable = JSON.parse(fs.readFileSync(path.join(root, "plugin.json"), "utf8"));
	const codex = JSON.parse(fs.readFileSync(path.join(root, ".codex-plugin/plugin.json"), "utf8"));
	const listings = [portable.extensions["com.openai"].interface, codex.interface];
	for (const listing of listings) {
		assert(listing.displayName.length <= 30);
		assert(listing.shortDescription.length <= 30);
		assert(listing.longDescription.length <= 4000);
		assert(listing.developerName.length <= 80);
	}
	assert.equal(portable.version, codex.version);
});

/** Check that only the temporary ZIP receives a hydrated Drive icon. */
test("publication build hydrates the verified Drive icon only into its archive", () => {
	const output = path.join(os.tmpdir(), `awts-shliach-test-${process.pid}.zip`);
	try {
		const report = build(undefined, output);
		assert.equal(report.ok, true, JSON.stringify(report.errors));
		assert(report.archiveBytes > 0);
		assert(fs.existsSync(output));
		assert.equal(fs.existsSync(path.join(root, "assets/gpt-icon.png")), false);
	} finally {
		fs.rmSync(output, { force: true });
	}
});

/** A false version or hidden commerce disclosure must reject submission. */
test("publication refuses mismatched version and absent commerce disclosure", () => {
	const temp = fs.mkdtempSync(path.join(os.tmpdir(), "awts-plugin-check-"));
	try {
		fs.cpSync(root, temp, { recursive: true });
		const metadata = path.join(temp, "plugin.json");
		const body = JSON.parse(fs.readFileSync(metadata, "utf8"));
		body.version = "9.9.9";
		body.extensions["com.openai"].review.commerce = false;
		fs.writeFileSync(metadata, JSON.stringify(body));
		const result = validate(temp);
		assert.equal(result.ok, false);
		assert(result.errors.includes("versions_inconsistent"));
		assert(result.errors.includes("external_credit_disclosure_missing"));
	} finally {
		fs.rmSync(temp, { recursive: true, force: true });
	}
});

/** Preserve exactly five positive and three negative reviewer cases. */
test("review submission rejects extra cases beyond exactly five and three", () => {
	const temp = fs.mkdtempSync(path.join(os.tmpdir(), "awts-plugin-review-"));
	try {
		fs.cpSync(root, temp, { recursive: true });
		const metadata = path.join(temp, "plugin.json");
		const body = JSON.parse(fs.readFileSync(metadata, "utf8"));
		const cases = body.extensions["com.openai"].review.test_cases;
		cases.positive.push({ ...cases.positive[0] });
		cases.negative.push({ ...cases.negative[0] });
		fs.writeFileSync(metadata, JSON.stringify(body));
		const report = validate(temp);
		assert.equal(report.ok, false);
		assert(report.errors.includes("review_requires_exactly_five_positive_cases"));
		assert(report.errors.includes("review_requires_exactly_three_negative_cases"));
	} finally {
		fs.rmSync(temp, { recursive: true, force: true });
	}
});
