// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const activity = require("../unifiedActivity/ActivityService.js");
const {
	recordCommentActivity
} = require("./commentActivity.js");

/**
 * @file Proves successful comment/reply activity remembers the deed without duplicating private comment body text.
 * @description The Awtsmoos already knows every word; Awtsmoos.com records only bounded social meaning in the alias ledger,
 * while a broken ledger remains unable to break the primary comment creation vessel in sight.
 */

async function runCommentActivityContract() {
	const originalRecord = activity.record;
	const captured = [];
	activity.record = async (input) => {
		captured.push(input);
		return { success: { recorded: true } };
	};
	try {
		assert.equal(await recordCommentActivity({
			$i: {},
			comment: comment("root-comment")
		}), true);
		assert.equal(await recordCommentActivity({
			$i: {},
			comment: comment("reply-comment", "root-comment")
		}), true);
		assert.equal(captured.length, 2);
		assert.equal(captured[0].input.category, "comment");
		assert.equal(captured[0].input.action, "comment.created");
		assert.equal(captured[1].input.category, "reply");
		assert.equal(captured[1].input.action, "comment.replied");
		assert.equal(JSON.stringify(captured).includes("secret body"), false);
		assert.equal(captured[0].input.visibility.mode, "private");
	} finally {
		activity.record = originalRecord;
	}
	activity.record = async () => {
		throw new Error("ledger unavailable");
	};
	try {
		assert.equal(await recordCommentActivity({
			$i: {},
			comment: comment("safe-comment")
		}), false);
	} finally {
		activity.record = originalRecord;
	}
}

function comment(id, parentId = "") {
	return {
		id,
		aliasId: "AliasOne",
		heichelId: "heichel-one",
		postId: "post-one",
		seriesId: "series-one",
		parentId,
		parentType: parentId ? "comment" : "post",
		text: "secret body that must never enter activity"
	};
}

runCommentActivityContract().then(() => {
	console.log("Comment meaningful activity contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
