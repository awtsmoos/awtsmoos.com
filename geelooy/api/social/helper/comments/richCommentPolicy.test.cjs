//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const access = require("./richCommentAccess.js");
const {
	deleteOne,
	deleteVerseComments
} = require("./richCommentDelete.js");
const {
	isCanonicalSource,
	mutationBlock
} = require("./richCommentPolicy.js");

/**
 * @file Immutability tests for native canonical Torah annotations.
 * @description The Awtsmoos lets discussion move around Torah while Awtsmoos.com keeps recovered source bodies and indexes beyond social mutation.
 */
function sourceComment() {
	return {
		id: "BH_source_rashi_test",
		aliasId: "rashi",
		verseSection: "1",
		dayuh: {
			torahAnnotation: {
				kind: "commentary",
				name: "Rashi",
				sourceId: "rashi"
			}
		}
	};
}

function restoreAccess(original) {
	access.getComment = original.getComment;
	access.read = original.read;
	access.write = original.write;
}

test("typed canonical annotations are immutable", () => {
	const source = sourceComment();
	assert.equal(isCanonicalSource(source), true);
	assert.ok(mutationBlock(source));
	assert.equal(isCanonicalSource({ aliasId: "rashi" }), false);
	assert.equal(mutationBlock({ aliasId: "rashi" }), null);
});

test("single native delete protects canonical source before any write", async () => {
	const original = { getComment: access.getComment, read: access.read, write: access.write };
	let writes = 0;
	access.getComment = () => ({ success: sourceComment() });
	access.write = () => { writes++;
	};
	try {
		const result = await deleteOne({
			$i: {}, heichelId: "ikar", postId: "BH_POST", commentId: "BH_source_rashi_test"
		});
		assert.equal(result.deleted, 0);
		assert.deepEqual(result.protected, ["BH_source_rashi_test"]);
		assert.equal(writes, 0);
	} finally {
		restoreAccess(original);
	}
});

test("bulk verse deletion preserves canonical source ID and never rewrites its body", async () => {
	const original = { getComment: access.getComment, read: access.read, write: access.write };
	const writes = [];
	access.read = () => ["BH_source_rashi_test"];
	access.getComment = () => ({ success: sourceComment() });
	access.write = (_$i, target, value) => writes.push({ target, value });
	try {
		const result = await deleteVerseComments({
			$i: {}, heichelId: "ikar", postId: "BH_POST", verseSection: "1"
		});
		assert.equal(result.success.deleted, 0);
		assert.deepEqual(result.success.protected, ["BH_source_rashi_test"]);
		assert.equal(writes.length, 1);
		assert.deepEqual(writes[0].value, ["BH_source_rashi_test"]);
		assert.match(writes[0].target, /\/byVerse\/1$/u);
	} finally {
		restoreAccess(original);
	}
});
