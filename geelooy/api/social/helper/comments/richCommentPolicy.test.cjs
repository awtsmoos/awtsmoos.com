//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const access = require("./richCommentAccess.js");
const { deleteOne } = require("./richCommentDelete.js");
const {
	isCanonicalSource,
	mutationBlock
} = require("./richCommentPolicy.js");

/**
 * @file Immutability tests for native canonical Torah annotations.
 * @description The Awtsmoos lets discussion move around Torah while the recovered source itself remains beyond social mutation.
 */
function sourceComment() {
	return {
		id: "BH_source_rashi_test",
		aliasId: "rashi",
		dayuh: {
			torahAnnotation: {
				kind: "commentary",
				name: "Rashi",
				sourceId: "rashi"
			}
		}
	};
}

test("typed canonical annotations are immutable", () => {
	const source = sourceComment();
	assert.equal(isCanonicalSource(source), true);
	assert.ok(mutationBlock(source));
	assert.equal(isCanonicalSource({ aliasId: "rashi" }), false);
	assert.equal(mutationBlock({ aliasId: "rashi" }), null);
});

test("single native delete protects canonical source before any write", async () => {
	const originalGet = access.getComment;
	const originalWrite = access.write;
	let writes = 0;
	access.getComment = () => ({ success: sourceComment() });
	access.write = () => {
		writes++;
	};
	try {
		const result = await deleteOne({
			$i: {},
			heichelId: "ikar",
			postId: "BH_POST",
			commentId: "BH_source_rashi_test"
		});
		assert.equal(result.deleted, 0);
		assert.deepEqual(result.protected, ["BH_source_rashi_test"]);
		assert.equal(writes, 0);
	} finally {
		access.getComment = originalGet;
		access.write = originalWrite;
	}
});
