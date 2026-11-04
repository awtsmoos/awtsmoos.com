//B"H
//Boruch Hashem
//Blessed be He

/**
 * Canonical singular-post route lifecycle proof for the social-acceptance pack.
 *
 * Run from the repository root:  node geelooy/api/social/helper/post/test/postCanonicalRoute.test.js
 *
 * The live acceptance failure this pins: a post that exists ONLY as a rich
 * record (heichelos/<h>/posts/<id>.awtsmoosJSON) while the packed series
 * object lacks it. Before the fix, GET repaired it from rich (so it always
 * rendered), PUT answered POST_NOT_FOUND (so edits failed), and DELETE
 * unlinked the absent packed entry and cascaded comments while leaving the
 * rich record behind (so the post resurrected on every read, forever).
 *
 * Covers:
 *  A. GET still repairs a packed miss from the rich record.
 *  B. PUT seeds the packed series from rich, retries the base edit, and
 *     synchronizes the rich copy forward.
 *  C. PUT with no rich record returns the base error untouched (no retry).
 *  D. DELETE removes the rich record after a successful base delete.
 *  E. DELETE on a refused base delete (error) removes nothing.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { sp } = require("../../_awtsmoos.constants.js");
const { canonicalPostHandler, richPath } = require("../../postCanonicalRoute.js");

let passed = 0;
function ok(name, cond) {
	assert.ok(cond, name);
	passed++;
	console.log("  ok -", name);
}

const VALUES = { heichel: "h1", series: "root", post: "post_1" };
const RICH = richPath(VALUES);
const PACKED = `${sp}/heichelos/h1/series/root/posts`;

function richRecord() {
	return {
		id: "post_1",
		postId: "post_1",
		heichelId: "h1",
		seriesId: "root",
		title: "Rich Title",
		author: "tedt"
	};
}

function make$i({ rich = null, packed = {} } = {}) {
	const calls = { write: [], delete: [], appendToObj: [] };
	const store = new Map([[PACKED, { ...packed }]]);
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "canonical-route-"));
	const db = {
		directory,
		async get(p) {
			if (p === RICH) return rich;
			return store.get(p) ?? null;
		},
		async getValue(p, key) {
			return (store.get(p) || {})[key] ?? null;
		},
		async write(p, value) {
			calls.write.push([p, value]);
			if (p === RICH) rich = value;
			return { success: true };
		},
		async delete(p) {
			calls.delete.push(p);
			if (p === RICH) rich = null;
			return { success: true };
		},
		async appendToObj(p, { key, value }) {
			calls.appendToObj.push([p, key, value]);
			const obj = store.get(p) || {};
			obj[key] = value;
			store.set(p, obj);
			return { success: true };
		}
	};
	return { $i: { db, request: { method: "GET" } }, calls, store, directory };
}

function handlerFor($i, baseHandler) {
	return canonicalPostHandler({ $i, baseHandler });
}

(async () => {
	// A. GET repair from rich.
	{
		const { $i, calls, store } = make$i({ rich: richRecord() });
		$i.request.method = "GET";
		const handler = handlerFor($i, async () => ({ error: { code: "POST_NOT_FOUND" } }));
		const result = await handler(VALUES);
		ok("A: GET returns the rich record", result?.title === "Rich Title");
		ok("A: GET seeds the packed series", calls.appendToObj.length === 1 && store.get(PACKED).post_1?.title === "Rich Title");
	}

	// B. PUT seeds, retries, and syncs rich forward.
	{
		const { $i, calls } = make$i({ rich: richRecord() });
		$i.request.method = "PUT";
		let attempts = 0;
		const handler = handlerFor($i, async () => {
			attempts++;
			if (attempts === 1) return { error: { code: "POST_NOT_FOUND", details: { postId: "post_1" } } };
			// The retried edit lands on the seeded packed record.
			const packed = await $i.db.getValue(PACKED, "post_1");
			await $i.db.appendToObj(PACKED, { key: "post_1", value: { ...packed, title: "Edited Title" } });
			return { success: { message: "Post updated", postId: "post_1" } };
		});
		const result = await handler(VALUES);
		ok("B: PUT succeeds after the rich seed", Boolean(result?.success));
		ok("B: base edit ran exactly twice", attempts === 2);
		const richWrite = calls.write.find(([p]) => p === RICH);
		ok("B: rich record synchronized to the edited packed record", richWrite?.[1]?.title === "Edited Title");
	}

	// C. PUT without a rich record returns the original error, no retry.
	{
		const { $i } = make$i({ rich: null });
		$i.request.method = "PUT";
		let attempts = 0;
		const handler = handlerFor($i, async () => {
			attempts++;
			return { error: { code: "POST_NOT_FOUND" } };
		});
		const result = await handler(VALUES);
		ok("C: original POST_NOT_FOUND returned", result?.error?.code === "POST_NOT_FOUND");
		ok("C: no retry without a rich record", attempts === 1);
	}

	// D. DELETE removes the rich record after success.
	{
		const { $i, calls } = make$i({ rich: richRecord() });
		$i.request.method = "DELETE";
		const handler = handlerFor($i, async () => ({ success: { message: "unlinked" } }));
		const result = await handler(VALUES);
		ok("D: delete result passes through", Boolean(result?.success));
		ok("D: rich record deleted", calls.delete.includes(RICH));
	}

	// E. DELETE refused by the base handler removes nothing.
	{
		const { $i, calls } = make$i({ rich: richRecord() });
		$i.request.method = "DELETE";
		const handler = handlerFor($i, async () => ({ error: { code: "NO_AUTH" } }));
		const result = await handler(VALUES);
		ok("E: refusal passes through", result?.error?.code === "NO_AUTH");
		ok("E: rich record kept on refusal", calls.delete.length === 0);
	}

	console.log(`postCanonicalRoute: ${passed} assertions passed`);
})().catch(error => {
	console.error(error);
	process.exit(1);
});
