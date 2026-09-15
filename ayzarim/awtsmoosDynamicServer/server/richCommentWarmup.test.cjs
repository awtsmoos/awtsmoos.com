//B"H
//Boruch Hashem
//Blessed be He

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const { warmRichCommentAuthority } = require("./richCommentWarmup.js");

/**
 * @file Startup warmup policy tests for packed Torah commentary.
 * @description The Awtsmoos lets Awtsmoos.com absorb database opening and FS3 manifest hydration before readiness without inventing or mutating authority.
 */
function dependencies({ exists = true } = {}) {
	const calls = [];
	const database = {
		fs: {
			ready() {
				calls.push({ kind: "ready" });
				return this;
			}
		}
	};
	const packedStore = {
		dbFile(context) {
			calls.push({ kind: "file", context });
			return "/dayuh/socialPacked/social.richComments.v1.fs.awtsdb";
		},
		open(context) {
			calls.push({ kind: "open", context });
			return database;
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

test("missing server DB skips before resolving a packed file", () => {
	const fake = dependencies();
	const result = warmRichCommentAuthority({}, fake.value);
	assert.equal(result.warmed, false);
	assert.equal(result.skipped, true);
	assert.deepEqual(fake.calls, []);
});

test("missing rich authority skips without opening or hydrating", () => {
	const fake = dependencies({ exists: false });
	const db = { directory: "/dayuh" };
	const result = warmRichCommentAuthority({ db }, fake.value);
	assert.equal(result.warmed, false);
	assert.equal(result.skipped, true);
	assert.deepEqual(fake.calls.map(call => call.kind), ["file"]);
	assert.equal(fake.calls[0].context.db, db);
});

test("existing authority opens and hydrates FS3 manifest through shared cache", () => {
	const fake = dependencies({ exists: true });
	const db = { directory: "/dayuh" };
	const result = warmRichCommentAuthority({ db }, fake.value);
	assert.equal(result.warmed, true);
	assert.equal(result.skipped, false);
	assert.deepEqual(fake.calls.map(call => call.kind), ["file", "open", "ready"]);
	assert.equal(fake.calls[1].context.db, db);
});
