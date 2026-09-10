//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file seriesReadCompatibility.test.js
 * @description
 * The Awtsmoos proves detailed series reads never require the fragile legacy
 * bulk-object vessel, while bounded child reads preserve deterministic order.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	readRecordsByIds,
	readUnmappedPosts
} = require("../seriesReadCompatibility.js");

/**
 * Builds the minimum database surface needed by the compatibility reader.
 * @param {string[]} ids Ordered legacy series identities.
 * @returns {{db: object, calls: object}} Mock database and observable counters.
 */
function database(ids) {
	const calls = { keys: 0, gets: 0 };
	const db = {
		__awtsmoosDbFsRouter: {
			maybe: async method => method === "getObjectKeys" ? ids : undefined
		},
		getObjectKeys: async () => {
			calls.keys++;
			return ids;
		},
		get: async path => {
			calls.gets++;
			const postId = String(path).split("/").at(-1);
			return { id: postId, title: `Post ${postId}` };
		}
	};
	return { db, calls };
}

test("detailed unmapped series avoids bulk standardReader", async () => {
	const ids = ["a", "b", "c"];
	const { db, calls } = database(ids);
	let standardCalls = 0;
	const records = await readUnmappedPosts({
		$i: { db },
		heichelId: "ikar",
		seriesId: "bereishis",
		withDetails: true,
		standardReader: async () => {
			standardCalls++;
			throw new Error("bulk legacy reader must stay dark");
		}
	});
	assert.deepEqual(records.map(record => record.id), ids);
	assert.equal(standardCalls, 0);
	assert.equal(calls.keys, 1);
	assert.equal(calls.gets, ids.length);
});

test("bounded child reads preserve requested order", async () => {
	const ids = Array.from({ length: 9 }, (_, index) => `p${index}`);
	let active = 0;
	let peak = 0;
	const db = {
		get: async path => {
			const id = String(path).split("/").at(-1);
			active++;
			peak = Math.max(peak, active);
			const index = Number(id.slice(1));
			await new Promise(resolve => setTimeout(resolve, (9 - index) * 2));
			active--;
			return { id };
		}
	};
	const records = await readRecordsByIds({
		$i: { db },
		heichelId: "ikar",
		seriesId: "bereishis"
	}, ids);
	assert.deepEqual(records.map(record => record.id), ids);
	assert.ok(peak <= 6);
	assert.ok(peak > 1);
});

test("canonical per-post reader restores missing child details", async () => {
	const ids = ["a"];
	let canonicalReads = 0;
	const db = {
		__awtsmoosDbFsRouter: { maybe: async () => ids },
		getObjectKeys: async () => ids,
		get: async () => null
	};
	const records = await readUnmappedPosts({
		$i: { db },
		heichelId: "ikar",
		seriesId: "bereishis",
		withDetails: true,
		postReader: async postId => {
			canonicalReads++;
			return { id: postId, title: "Bereishis" };
		}
	});
	assert.deepEqual(records, [{ id: "a", title: "Bereishis" }]);
	assert.equal(canonicalReads, 1);
});
