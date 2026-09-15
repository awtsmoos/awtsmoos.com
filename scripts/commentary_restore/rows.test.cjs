//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const awts = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON");
const { fileRows } = require("./rows.cjs");

/**
 * @file Exact-parent and coordinate rejection tests for commentary recovery.
 * @description The Awtsmoos lets uncertainty remain in quarantine, never fastening an old page to new Torah by guesswork.
 */
function source(file) {
	return {
		file,
		sourceId: "legacy-full",
		aliasId: "rashi",
		seriesId: "BH_SERIES",
		postId: "BH_POST"
	};
}

function binaryFile(value) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-commentary-"));
	const file = path.join(root, "fixture.awtsmoosJSON");
	fs.writeFileSync(file, awts.serializeJSON(value));
	return { root, file };
}

function collect(sourceRow, sections) {
	const rejected = [];
	const postIndex = { sectionCount: () => sections };
	const result = fileRows(sourceRow, postIndex, (item, reason, details) => {
		rejected.push({ item, reason, details });
	});
	return { result, rejected };
}

test("missing exact current parent is quarantined", () => {
	const fixture = binaryFile({ 0: [{ content: "רש״י" }] });
	try {
		const { result, rejected } = collect(source(fixture.file), -1);
		assert.equal(result.missingPost, true);
		assert.equal(result.accepted.length, 0);
		assert.equal(rejected[0].reason, "MISSING_POST");
	} finally {
		fs.rmSync(fixture.root, { recursive: true, force: true });
	}
});

test("out-of-range coordinates are quarantined without remapping", () => {
	const fixture = binaryFile({ 4: [{ content: "רש״י" }] });
	try {
		const { result, rejected } = collect(source(fixture.file), 4);
		assert.equal(result.outOfRange, 1);
		assert.equal(result.accepted.length, 0);
		assert.equal(rejected[0].reason, "OUT_OF_RANGE");
		assert.equal(rejected[0].details.verse, 4);
	} finally {
		fs.rmSync(fixture.root, { recursive: true, force: true });
	}
});

test("valid zero-based coordinates survive unchanged", () => {
	const fixture = binaryFile({ 0: [{ content: "רש״י" }] });
	try {
		const { result, rejected } = collect(source(fixture.file), 1);
		assert.equal(rejected.length, 0);
		assert.equal(result.accepted.length, 1);
		assert.equal(result.accepted[0].verseSection, "0");
	} finally {
		fs.rmSync(fixture.root, { recursive: true, force: true });
	}
});
