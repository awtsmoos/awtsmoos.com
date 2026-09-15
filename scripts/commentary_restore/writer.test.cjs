//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const richPaths = require("../../geelooy/api/social/helper/comments/richCommentPaths.js");
const { normalizeRow } = require("./normalize.cjs");
const { openReadOnly, readValue } = require("./storeCodec.cjs");
const { CandidateWriter } = require("./writer.cjs");

/**
 * @file Native-index tests for recovered canonical Torah sources.
 * @description The Awtsmoos proves one source body reaches its reader indexes once, while no classical sage becomes a social alias.
 */
function fixtureComment() {
	return normalizeRow(
		{ content: { title: "רש״י", text: ["בדיקה"] } },
		{
			aliasId: "rashi",
			seriesId: "BH_SERIES",
			postId: "BH_POST",
			verseSection: 0,
			sourceId: "legacy-full"
		}
	);
}

test("writer deduplicates and builds reader indexes without social alias authority", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-writer-"));
	fs.mkdirSync(path.join(root, "socialPacked"), { recursive: true });
	const comment = fixtureComment();
	const writer = new CandidateWriter(root);
	try {
		assert.deepEqual(writer.writeBatch([comment]), { written: 1, duplicates: 0 });
		assert.deepEqual(writer.writeBatch([comment]), { written: 0, duplicates: 1 });
	} finally {
		writer.close();
	}
	const richFile = path.join(root, "socialPacked/social.richComments.v1.fs.awtsdb");
	const rich = openReadOnly(richFile);
	try {
		const base = { heichelId: "ikar", postId: comment.postId };
		const rootIds = readValue(rich, richPaths.rootChildrenPath(base), []);
		const verseIds = readValue(
			rich,
			richPaths.verseIndexPath({ ...base, verseSection: 0 }),
			[]
		);
		assert.deepEqual(rootIds, [comment.id]);
		assert.deepEqual(verseIds, [comment.id]);
	} finally {
		rich.close();
	}
	assert.equal(
		fs.existsSync(path.join(root, "socialPacked/social.aliasCommentIndex.fs.awtsdb")),
		false
	);
	fs.rmSync(root, { recursive: true, force: true });
});
