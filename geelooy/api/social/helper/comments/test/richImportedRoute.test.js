// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

/** Proves imported-only paging from external data without native comment reads. */
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-imported-comments-"));
const postId = "BH_POST_fixture";
const seriesId = "אדר_meluket";
process.env.AWTSMOOS_IMPORTED_COMMENT_DATA_ROOT = fixtureRoot;
writeFixture();

const richRoutes = require("../routes/rich.js");
let nativeReads = 0;
const $i = {
	request: { method: "GET" },
	$_GET: { seriesId, kind: "sectionSummaryBrief", limit: "2" },
	$_POST: {},
	$_DELETE: {},
	db: {
		async get() {
			nativeReads += 1;
			throw new Error("native comment storage must not be touched");
		},
		async getValue() {
			return { id: postId, title: "Meluket", content: [], sections: [] };
		}
	}
};

async function run() {
	try {
		const routes = richRoutes({ $i, userid: null });
		const endpoint = routes["/heichelos/:heichel/posts/:post/imported-comment-tree"];
		assert.equal(typeof endpoint, "function");
		const summaries = await endpoint({ heichel: "ikar", post: postId });
		assert.equal(nativeReads, 0);
		assert.equal(summaries.success.length, 2);
		assert.ok(summaries.success.every(row => row.imported === true));
		assert.ok(summaries.success.every(row => row.dayuh?.kind === "sectionSummaryBrief"));
		$i.$_GET = { seriesId, kind: "translation", limit: "3" };
		const translations = await endpoint({ heichel: "ikar", post: postId });
		assert.equal(translations.success.length, 3);
		assert.ok(translations.success.every(row => row.dayuh?.kind === "translation"));
		$i.request.method = "POST";
		const blocked = await endpoint({ heichel: "ikar", post: postId });
		assert.equal(blocked.error?.code, "IMPORTED_COMMENT_READ_ONLY");
		assert.equal(nativeReads, 0);
		console.log("richImportedRoute.test.js PASS");
	} finally {
		fs.rmSync(fixtureRoot, { recursive: true, force: true });
	}
}

function writeFixture() {
	const root = path.join(fixtureRoot, "meluket");
	fs.mkdirSync(path.join(root, "posts"), { recursive: true });
	const postFile = "posts/fixture.json";
	fs.writeFileSync(path.join(root, "manifest.json"), JSON.stringify({
		fingerprint: "fixture-v1",
		series: { [seriesId]: [postId] },
		posts: { [`${seriesId}\0${postId}`]: postFile }
	}));
	const rows = [
		row("summary-1", "sectionSummaryBrief"),
		row("summary-2", "sectionSummaryBrief"),
		row("translation-1", "translation"),
		row("translation-2", "translation"),
		row("translation-3", "translation")
	];
	fs.writeFileSync(path.join(root, postFile), JSON.stringify({ rows }));
}

function row(id, kind) {
	return {
		id,
		content: id,
		verseSection: "1",
		subsectionId: id,
		dayuh: { kind, language: "en" }
	};
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
