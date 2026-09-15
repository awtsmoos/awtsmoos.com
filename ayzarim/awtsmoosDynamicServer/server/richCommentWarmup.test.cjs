//B"H
//Boruch Hashem
//Blessed be He

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const { warmRichCommentAuthority } = require("./richCommentWarmup.js");

/**
 * @file Startup warmup policy tests for packed Torah commentary.
 * @description The Awtsmoos lets Awtsmoos.com absorb heavyweight authority opening before readiness without inventing files or opening the wrong Dayuh vessel.
 */
function dependencies({ exists = true } = {}) {
	const calls = [];
	const packedStore = {
		dbFile(context) {
			calls.push({ kind: "file", context });
			return "/dayuh/socialPacked/social.richComments.v1.fs.awtsdb";
		},
		open(context) {
			calls.push({ kind: "open", context });
			return { opened: true };
		}
	};
	return {
		calls,
		value: {
			packedStore,
			fs: { existsSync: () => exists }
		}
	};
}

test("missing server DB skips without resolving or opening a packed file", () => {
	const fake = dependencies();
	const result = warmRichCommentAuthority({}, fake.value);
	assert.equal(result.warmed, false);
	assert.equal(result.skipped, true);
	assert.deepEqual(fake.calls, []);
});

test("missing rich authority skips without creating a new database", () => {
	const fake = dependencies({ exists: false });
	const db = { directory: "/dayuh" };
	const result = warmRichCommentAuthority({ db }, fake.value);
	assert.equal(result.warmed, false);
	assert.equal(result.skipped, true);
	assert.deepEqual(fake.calls.map(call => call.kind), ["file"]);
	assert.equal(fake.calls[0].context.db, db);
});

test("existing rich authority opens through the shared packed-store cache", () => {
	const fake = dependencies({ exists: true });
	const db = { directory: "/dayuh" };
	const result = warmRichCommentAuthority({ db }, fake.value);
	assert.equal(result.warmed, true);
	assert.equal(result.skipped, false);
	assert.deepEqual(fake.calls.map(call => call.kind), ["file", "open"]);
	assert.equal(fake.calls[1].context.db, db);
});
