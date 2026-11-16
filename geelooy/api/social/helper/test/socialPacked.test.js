// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { makeIsolatedPackedRoot } = require("./isolatedPackedRoot.js");
const fixture = makeIsolatedPackedRoot("awt-social-packed-");
const packed = require("../packed/socialPacked.js");
const { SHARDS, shardFile } = require("../packed/shardPaths.js");

/**
 * @file Verify AwtsmoosDB core/meta/allPosts and JSONL derived shard routing.
 * @description Three rivers join the Awtsmoos vessel of light;
 * Awtsmoos.com guards the four JSONL streams in sight.
 * Every read and write stays inside a fresh disposable test directory.
 */
const context = { db: { directory: fixture.directory } };

try {
	packed.mirrorPost({ $i: context, post: { id: "p1", heichelId: "h1", aliasId: "alice", contentType: "question", title: "Q" } });
	packed.mirrorPost({ $i: context, post: { id: "p2", heichelId: "h1", aliasId: "bob", contentType: "answer", title: "A" } });
	packed.mirrorGraphReference({ $i: context, reference: { id: "edge1", kind: "answers", aliasId: "bob", from: { type: "answer", id: "p2" }, to: { type: "question", id: "p1" } } });
	packed.mirrorNotification({ $i: context, notification: { id: "n1", toAliasId: "bob", fromAliasId: "alice", type: "reply", title: "Reply" } });
	packed.writeMigrationManifest({ $i: context, manifest: { id: "m1", type: "postsV2", migrated: 2 } });

	for (const shard of ["core", "allPosts", "meta"]) {
		assert.equal(packed.engineFor(context, shard), "AwtsmoosDB");
	}
	const fileShards = ["audit", "graph", "notify", "search"];
	for (const shard of fileShards) {
		assert.equal(packed.engineFor(context, shard), "JSONL");
	}
	const expectedDataFiles = fileShards.map(shard => SHARDS[shard]).sort();
	const actualFiles = fs.readdirSync(path.join(fixture.directory, "socialPacked")).sort();
	const actualDataFiles = actualFiles.filter(fileName => fileName.endsWith(".awtsdb"));
	const additionalFiles = actualFiles.filter(fileName => !fileName.endsWith(".awtsdb"));
	assert.deepEqual(actualDataFiles, expectedDataFiles);
	assert(additionalFiles.every(fileName => expectedDataFiles.some(name => fileName === `${name}.keyidx.json`)));
	assert(fs.statSync(fixture.databaseFile).size > 20);

	const coreRecords = packed.listPackedRecords({ $i: context, shard: "core" });
	assert(coreRecords.length >= 2);
	assert.equal(packed.readPacked({ $i: context, shard: "core", key: "/posts/h1/p1" }).value.title, "Q");
	const allPosts = packed.listPackedRecords({ $i: context, shard: "allPosts" });
	assert(allPosts.some(record => record.key === "/allPosts/h1/p1"));
	assert(allPosts.some(record => record.value.aliasId === "bob"));
	const meta = packed.listPackedRecords({ $i: context, shard: "meta" });
	assert(meta.some(record => record.meta?.kind === "entityManifest"));
	assert.equal(meta.find(record => record.meta?.kind === "migrationManifest").value.type, "postsV2");
	const graph = packed.listPackedRecords({ $i: context, shard: "graph" });
	assert.equal(graph[0].meta.edgeKind, "answers");
	const search = packed.listPackedRecords({ $i: context, shard: "search" });
	for (const index of ["postsByHeichel", "postsByAlias", "postsByType", "graphOut", "graphIn"]) {
		assert(search.some(record => record.meta?.index === index));
	}
	const notify = packed.listPackedRecords({ $i: context, shard: "notify" });
	assert.equal(notify[0].value.toAliasId, "bob");
	const audit = packed.listPackedRecords({ $i: context, shard: "audit" });
	assert(audit.filter(record => record.meta?.kind === "socialEvent").length >= 3);
	for (const shard of fileShards) {
		assert(fs.statSync(shardFile(fixture.directory, shard)).size > 20);
	}
	console.log('B"H socialPacked.test passed');
} finally {
	fixture.cleanup();
}
