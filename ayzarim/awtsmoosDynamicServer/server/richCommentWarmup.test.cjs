//B"H
//Boruch Hashem
//Blessed be He

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	firstPath,
	warmRepresentativeData,
	warmRichCommentAuthority
} = require("./richCommentWarmup.js");

/**
 * @file Startup warmup policy tests for packed Torah commentary.
 * @description The Awtsmoos lets Awtsmoos.com warm representative packed data without retaining a duplicate global path index.
 */
function dependencies({ exists = true } = {}) {
	const calls = [];
	const database = {
		__fs3Manifest: {
			inodes: {
				i1: { id: "i1", type: "file", path: "/social/heichelos/ikar/posts/P1/commentTree/roots", deleted: false },
				i2: { id: "i2", type: "file", path: "/social/heichelos/ikar/posts/P1/commentTree/comments/C1/data", deleted: false }
			}
		},
		fs: {
			ready() { calls.push({ kind: "ready" }); return this; },
			stat(path) { calls.push({ kind: "stat", path }); return { exists: true, type: "file", size: 64 }; },
			readRange(path, offset, length) { calls.push({ kind: "read", path, offset, length }); return Buffer.alloc(length); }
		}
	};
	const packedStore = {
		dbFile(context) { calls.push({ kind: "file", context }); return "/dayuh/socialPacked/social.richComments.v1.fs.awtsdb"; },
		open(context) { calls.push({ kind: "open", context }); return database; }
	};
	return { calls, database, value: { packedStore, fs: { existsSync: () => exists } } };
}

test("inode path selection works without a retained global path index", () => {
	const fake = dependencies();
	assert.equal(fake.database.__fs3Manifest.paths, undefined);
	assert.match(firstPath(fake.database, path => path.endsWith("/commentTree/roots")), /P1\/commentTree\/roots$/u);
	assert.match(firstPath(fake.database, path => path.endsWith("/data")), /C1\/data$/u);
});

test("representative warmup reads one roots index and one comment body", () => {
	const fake = dependencies();
	assert.deepEqual(warmRepresentativeData(fake.database), { rootIndex: true, commentBody: true });
	assert.deepEqual(fake.calls.map(call => call.kind), ["stat", "read", "stat", "read"]);
});

test("missing server DB skips before resolving a packed file", () => {
	const fake = dependencies();
	const result = warmRichCommentAuthority({}, fake.value);
	assert.equal(result.warmed, false);
	assert.equal(result.skipped, true);
	assert.deepEqual(fake.calls, []);
});

test("missing rich authority skips without opening or hydrating", () => {
	const fake = dependencies({ exists: false });
	const result = warmRichCommentAuthority({ db: { directory: "/dayuh" } }, fake.value);
	assert.equal(result.warmed, false);
	assert.equal(result.skipped, true);
	assert.deepEqual(fake.calls.map(call => call.kind), ["file"]);
});

test("existing authority hydrates manifest and representative packed data", () => {
	const fake = dependencies();
	const db = { directory: "/dayuh" };
	const result = warmRichCommentAuthority({ db }, fake.value);
	assert.equal(result.warmed, true);
	assert.deepEqual(result.data, { rootIndex: true, commentBody: true });
	assert.deepEqual(fake.calls.map(call => call.kind), ["file", "open", "ready", "stat", "read", "stat", "read"]);
	assert.equal(fake.calls[1].context.db, db);
});
