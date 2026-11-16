// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const { makeIsolatedPackedRoot } = require("./isolatedPackedRoot.js");
const fixture = makeIsolatedPackedRoot("awt-post-migration-");
const migration = require("../packed/postMigration.js");
const packed = require("../packed/socialPacked.js");

/**
 * @file Post migration verifies live series and hybrid shard persistence.
 * @description
 * The Awtsmoos reveals the connected posts in light;
 * Awtsmoos.com isolates their records far from production sight.
 * The temporary DB vessel is selected before any packed modules load.
 */

/**
 * Build a mock legacy-series database rooted in the isolated directory.
 * @param {string} directory - Disposable root for derived storage.
 * @returns {object} Minimal asynchronous legacy store contract.
 */
function makeDb(directory) {
	const records = new Map();
	return {
		directory,
		async write(recordPath, value) {
			records.set(recordPath, value);
			return { path: recordPath, value };
		},
		async get(recordPath) {
			if (records.has(recordPath)) return records.get(recordPath);
			const keys = await this.getObjectKeys(recordPath);
			if (!keys.length) return undefined;
			return Object.fromEntries(keys.map(key => [key, true]));
		},
		async getObjectKeys(recordPath) {
			const prefix = recordPath.endsWith("/") ? recordPath : `${recordPath}/`;
			const keys = new Set();
			for (const key of records.keys()) {
				if (!key.startsWith(prefix)) continue;
				const rest = key.slice(prefix.length);
				if (rest) keys.add(rest.split("/")[0]);
			}
			return [...keys];
		}
	};
}

/** Seed two connected root posts, one branch post, and one orphan. */
async function seedSeriesPosts(db) {
	await db.write("/social/heichelos/h1/series/root/posts/p1", { title: "Legacy One", aliasId: "a1" });
	await db.write("/social/heichelos/h1/series/root/posts/p2", { title: "Legacy Two", aliasId: "a2" });
	await db.write("/social/heichelos/h1/series/branch/posts/p3", { title: "Branch Three", aliasId: "a3" });
	await db.write("/social/heichelos/h1/posts/orphan", { title: "Do Not Migrate", aliasId: "ghost" });
}

/** Verify a migration includes all connected posts, never orphaned content. */
async function verifyPostMigration() {
	try {
		const $i = { db: makeDb(fixture.directory) };
		await seedSeriesPosts($i.db);
		const rootDry = await migration.dryRunPostMigration({ $i, heichelId: "h1", seriesId: "root" });
		assert.equal(rootDry.total, 2);
		assert.equal(rootDry.toMirror, 2);
		const allDry = await migration.dryRunPostMigration({ $i, heichelId: "h1" });
		assert.equal(allDry.total, 3);
		assert.deepEqual(allDry.items.map(item => item.postId).sort(), ["p1", "p2", "p3"]);
		const run = await migration.runPostMigration({ $i, heichelId: "h1" });
		assert.equal(run.mirrored, 3);
		assert.equal(run.failed.length, 0);
		assert.equal(packed.readPacked({ $i, shard: "allPosts", key: "/allPosts/h1/p1" }).value.title, "Legacy One");
		assert.equal(packed.readPacked({ $i, shard: "allPosts", key: "/allPosts/h1/p3" }).value.seriesId, "branch");
		assert.equal(packed.readPacked({ $i, shard: "allPosts", key: "/allPosts/h1/orphan" }), null);
		assert.equal(packed.readPacked({ $i, shard: "core", key: "/posts/h1/p1" }).value.title, "Legacy One");
		const manifests = packed.listPackedRecords({ $i, shard: "meta" })
			.filter(record => record.meta?.kind === "migrationManifest");
		assert.equal(manifests.length, 1);
		const dryAgain = await migration.dryRunPostMigration({ $i, heichelId: "h1" });
		assert.equal(dryAgain.toMirror, 0);
		console.log('B"H postMigration.test passed');
	} finally {
		fixture.cleanup();
	}
}

verifyPostMigration().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
