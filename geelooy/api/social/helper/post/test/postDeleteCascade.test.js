//B"H
//Boruch Hashem
//Blessed be He

/**
 * Posts / series / heichel delete-cascade proof for the edit-delete pack.
 *
 * Run from the repository root:  node geelooy/api/social/helper/post/test/postDeleteCascade.test.js
 *
 * Covers, with in-memory doubles plus one real DosDB store:
 *  A. deletePostFromSeries gate matrix (missing alias, non-editor refused,
 *     editor succeeds) and the author-capture fix: the cleanup job must
 *     carry a postsSubmitted DELETE_ENTRY for the post's AUTHOR even though
 *     the post record is already unlinked when the compiler runs.
 *  B. The series compiler's post sink (parent + nested child posts) and its
 *     per-post tracking tasks.
 *  C. deleteAllRichCommentsForPost against a real DosDB-backed rich comment
 *     store: a root comment and its reply are tombstoned, the root index is
 *     emptied, and another post's comments are untouched.
 *  D. deleteHeichelForAlias creator-only matrix (route-tool factory with
 *     injected dependencies).
 *  E. deleteSeriesFromHeichel end-to-end smoke: gates hold and the rich
 *     cascade is attempted for every post in the deleted subtree.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "../../../../../..");
const { sp } = require("../../_awtsmoos.constants.js");
const { deletePostFromSeries, compileDeletionTasksForSinglePost } = require("../indexDelete.js");
const { compileFullDeletionTasksForSingleSeries } = require("../../seriesDelete.js");
const { deleteSeriesFromHeichel } = require("../../seriesDeleteExec.js");
const { deleteAllRichCommentsForPost } = require("../../comments/richCommentCascade.js");
const { makeHeichelRouteTools } = require("../../heichelRoutes/routeTools.js");

let passed = 0;
function ok(name, cond) {
	assert.ok(cond, name);
	passed++;
	console.log("  ok -", name);
}

/** Builds a fake $i whose db serves the given editors list and post map. */
function makePostDelete$i({ editors = [], posts = {}, ownedAliases = [] } = {}) {
	const store = new Map();
	const postsPath = `${sp}/heichelos/h1/series/s1/posts`;
	store.set(postsPath, { ...posts });
	const jobs = [];
	const $i = {
		$_POST: {},
		$_DELETE: {},
		$_GET: {},
		request: { headers: {} },
		db: {
			async getValue(p, key) {
				const obj = store.get(p);
				return obj ? obj[key] : undefined;
			},
			async deleteEntry(p, key) {
				const obj = store.get(p);
				if (obj) delete obj[key];
			},
			async get(p) {
				if (p.endsWith("/editors")) return editors;
				return store.get(p);
			}
		},
		async fetchAwtsmoos(url) {
			if (url.includes("/ownership")) {
				const alias = url.split("/alias/")[1].split("/")[0];
				return ownedAliases.includes(alias) ? {} : { no: true };
			}
			if (url.endsWith("/breadcrumb")) return [{ id: "root" }, { id: "s1" }];
			throw new Error("unexpected fetch " + url);
		},
		async createJob(job) {
			jobs.push(job);
			return { jobId: "job-" + jobs.length };
		}
	};
	return { $i, jobs, store, postsPath };
}

async function partA() {
	console.log("A. deletePostFromSeries gates + author capture");
	const fixture = () => makePostDelete$i({
		editors: ["editorEd", "authorA"],
		ownedAliases: ["editorEd", "authorA", "stranger"],
		posts: { p1: { author: "authorA", title: "Hello" } }
	});

	{	// missing aliasId
		const { $i, jobs, store, postsPath } = fixture();
		$i.$_DELETE = {};
		const res = await deletePostFromSeries({ $i, heichelId: "h1", seriesId: "s1", postId: "p1", userid: "u1" });
		ok("missing aliasId refused", !!res.error);
		ok("post untouched after missing-alias refusal", !!store.get(postsPath).p1);
		ok("no job scheduled on refusal", jobs.length === 0);
	}
	{	// non-editor refused
		const { $i, jobs, store, postsPath } = fixture();
		$i.$_DELETE = { aliasId: "stranger" };
		const res = await deletePostFromSeries({ $i, heichelId: "h1", seriesId: "s1", postId: "p1", userid: "u9" });
		ok("non-editor refused with NO_AUTH", res.error && JSON.stringify(res.error).includes("NO_AUTH"));
		ok("post untouched after NO_AUTH", !!store.get(postsPath).p1);
		ok("no job scheduled on NO_AUTH", jobs.length === 0);
	}
	{	// editor deletes another author's post; author tracking task must exist
		const { $i, jobs, store, postsPath } = fixture();
		$i.$_DELETE = { aliasId: "editorEd" };
		const res = await deletePostFromSeries({ $i, heichelId: "h1", seriesId: "s1", postId: "p1", userid: "u2" });
		ok("editor delete succeeds", !!res.success);
		ok("post unlinked synchronously", !store.get(postsPath).p1);
		ok("exactly one cleanup job scheduled", jobs.length === 1);
		const tasks = jobs[0].tasks;
		const tracking = tasks.find(t => t.operation === "DELETE_ENTRY");
		ok("tracking DELETE_ENTRY task compiled", !!tracking);
		ok("tracking task targets the AUTHOR, not the deleter",
			tracking.params.path.includes(`/aliases/authorA/postsSubmitted/`) && tracking.params.key === "p1");
		ok("legacy comments DELETE_PATH task compiled",
			tasks.some(t => t.operation === "DELETE_PATH" && t.params.path.includes("/comments/atSeries/s1/atPost/p1")));
	}
	{	// compiler fallback contract: author passed in, record already gone
		const { $i } = fixture();
		const tasks = await compileDeletionTasksForSinglePost({
			$i, heichelId: "h1", seriesId: "s1", postId: "ghost", authorAliasId: "authorA"
		});
		ok("compiler honors a captured author when the record is gone",
			tasks.some(t => t.operation === "DELETE_ENTRY" && t.params.path.includes("/aliases/authorA/")));
	}
}

async function partB() {
	console.log("B. series compiler post sink");
	const fixtures = {
		parent: { prateem: { author: "a1" }, posts: { p1: { author: "a1" }, p2: { author: "a2" } }, sub: ["child"] },
		child: { prateem: { author: "a3" }, posts: { p3: { author: "a3" } }, sub: [] }
	};
	const db = {
		async get(p) {
			const m = p.match(/\/series\/([^/]+)\/(prateem|posts|subSeries)$/);
			if (!m) return undefined;
			const f = fixtures[m[1]];
			if (!f) return undefined;
			if (m[2] === "prateem") return f.prateem;
			if (m[2] === "posts") return f.posts;
			return f.sub;
		}
	};
	const sink = [];
	const tasks = await compileFullDeletionTasksForSingleSeries({
		$i: { db }, heichelId: "h1", seriesId: "parent",
		parentBreadcrumb: [{ id: "root" }], postSink: sink
	});
	ok("sink collected parent posts", sink.some(e => e.postId === "p1") && sink.some(e => e.postId === "p2"));
	ok("sink collected nested child post", sink.some(e => e.postId === "p3" && e.seriesId === "child"));
	ok("per-post tracking tasks compiled for all three posts",
		tasks.filter(t => t.operation === "DELETE_ENTRY").length === 3);
	ok("series tracking removal compiled for child author",
		tasks.some(t => t.operation === "REMOVE_FROM_ARRAY" && t.params.path.includes("/aliases/a3/")));
}

async function partC() {
	console.log("C. rich comment cascade on a real store");
	const DosDB = require(path.join(repoRoot, "ayzarim/DosDB/index.js"));
	const { createComment, getTree } = require("../../comments/richCommentStore.js");
	const access = require("../../comments/richCommentAccess.js");
	const paths = require("../../comments/richCommentPaths.js");
	const dbRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-post-cascade-"));
	const db = new DosDB(dbRoot);
	await db.init();
	const $i = { db, $_GET: {}, $_POST: {}, $_DELETE: {}, request: { headers: {} } };
	const heichelId = "h_cascade";
	const postId = "post_cascade";
	const otherPostId = "post_other";
	await db.write("/users/u1/aliases/alice", { aliasId: "alice" });
	await db.write("/users/u2/aliases/bob", { aliasId: "bob" });
	await db.write("/social/aliases/alice/info", { user: "u1" });
	await db.write("/social/aliases/bob/info", { user: "u2" });

	$i.$_POST = { aliasId: "alice", content: "root comment", verseSection: "root" };
	const root = await createComment({ $i, userid: "u1", heichelId, postId, aliasId: "alice" });
	assert.ok(root.success && root.success.id, JSON.stringify(root));
	$i.$_POST = { aliasId: "bob", content: "a reply", verseSection: "root" };
	const reply = await createComment({ $i, userid: "u2", heichelId, postId, parentId: root.success.id, aliasId: "bob" });
	assert.ok(reply.success && reply.success.id, JSON.stringify(reply));
	$i.$_POST = { aliasId: "alice", content: "other post comment", verseSection: "root" };
	const other = await createComment({ $i, userid: "u1", heichelId, postId: otherPostId, aliasId: "alice" });
	assert.ok(other.success && other.success.id, JSON.stringify(other));

	const result = await deleteAllRichCommentsForPost({ $i, heichelId, postId, reason: "post-deleted" });
	ok("cascade reports both comments deleted", result.deleted === 2);
	ok("cascade saw exactly one root", result.roots === 1);
	const rootsAfter = access.array(access.read($i, paths.rootChildrenPath(access.context(heichelId, postId, {})), []));
	ok("root index emptied after cascade", rootsAfter.length === 0);
	const tomb = access.getComment({ $i, heichelId, postId, commentId: root.success.id });
	ok("root comment tombstoned with body cleared",
		tomb.success && tomb.success.deleted === true && tomb.success.content === "");
	const tree = await getTree({ $i, heichelId, postId: otherPostId });
	ok("other post's comments untouched", Array.isArray(tree.success) && tree.success.length === 1);
	fs.rmSync(dbRoot, { recursive: true, force: true });
}

async function partD() {
	console.log("D. deleteHeichelForAlias creator-only matrix");
	const calls = [];
	const tools = makeHeichelRouteTools({
		getHeichel: async ({ heichelId }) => ({ id: heichelId, name: "H", author: "creator" }),
		getHeichelos: async () => [],
		createHeichel: async () => ({}),
		deleteHeichel: async (args) => { calls.push(args); return { message: "deleted" }; },
		verifyHeichelAuthority: async ({ aliasId }) => ["creator", "editorEd"].includes(aliasId),
		er: (e) => ({ error: e }),
		requireArray: (v) => ({ ok: true, value: v }),
		awtsmoosError: (e) => ({ error: e })
	});
	const $i = { $_POST: {}, $_DELETE: {}, $_GET: {} };

	let res = await tools.deleteHeichelForAlias({ $i, aliasId: "", heichelId: "h1" });
	ok("no alias refused", !!res.error && res.error.code === "NO_ALIAS");
	res = await tools.deleteHeichelForAlias({ $i, aliasId: "stranger", heichelId: "h1" });
	ok("non-editor refused", !!res.error && res.error.code === "NO_HEICHEL_AUTHORITY");
	res = await tools.deleteHeichelForAlias({ $i, aliasId: "editorEd", heichelId: "h1" });
	ok("editor who is not the creator refused for whole-heichel delete",
		!!res.error && res.error.code === "HEICHEL_DELETE_CREATOR_ONLY");
	ok("delete primitive not reached for non-creator", calls.length === 0);
	res = await tools.deleteHeichelForAlias({ $i, aliasId: "creator", heichelId: "h1" });
	ok("creator delete reaches the primitive", calls.length === 1 && !!res.message);

	const legacyTools = makeHeichelRouteTools({
		getHeichel: async () => ({ id: "h9", name: "Legacy" }),
		getHeichelos: async () => [],
		createHeichel: async () => ({}),
		deleteHeichel: async (args) => { calls.push(args); return { message: "deleted" }; },
		verifyHeichelAuthority: async () => true,
		er: (e) => ({ error: e }),
		requireArray: (v) => ({ ok: true, value: v }),
		awtsmoosError: (e) => ({ error: e })
	});
	res = await legacyTools.deleteHeichelForAlias({ $i, aliasId: "editorEd", heichelId: "h9" });
	ok("legacy heichel without a named creator keeps the authority-only behavior", calls.length === 2);
}

async function partE() {
	console.log("E. deleteSeriesFromHeichel smoke");
	const fixtures = {
		s1: { prateem: { author: "a1" }, posts: { p1: { author: "a1" } }, sub: [] }
	};
	const jobs = [];
	const $i = {
		$_POST: { aliasId: "editorEd" },
		$_DELETE: {},
		$_GET: {},
		request: { headers: {} },
		db: {
			async get(p) {
				if (p.endsWith("/editors")) return ["editorEd"];
				const m = p.match(/\/series\/([^/]+)\/(prateem|posts|subSeries)$/);
				if (!m) return undefined;
				const f = fixtures[m[1]];
				if (!f) return undefined;
				return m[2] === "prateem" ? f.prateem : m[2] === "posts" ? f.posts : f.sub;
			}
		},
		async fetchAwtsmoos(url) {
			if (url.includes("/ownership")) return {};
			if (url.endsWith("/breadcrumb")) return [{ id: "root" }];
			throw new Error("unexpected fetch " + url);
		},
		async createJob(job) { jobs.push(job); return { jobId: "job-s" }; }
	};
	const refused = await deleteSeriesFromHeichel({
		$i: { ...$i, $_POST: { aliasId: "stranger" } },
		heichelId: "h1", seriesId: "s1", parentSeriesId: "root", userid: "u9"
	});
	ok("series delete refuses a non-editor", !!refused.error && jobs.length === 0);
	const rootRefused = await deleteSeriesFromHeichel({
		$i, heichelId: "h1", seriesId: "root", parentSeriesId: "root", userid: "u1"
	});
	ok("the root series can never be deleted", !!rootRefused.error);
	const res = await deleteSeriesFromHeichel({
		$i, heichelId: "h1", seriesId: "s1", parentSeriesId: "root", userid: "u1"
	});
	ok("series delete queues its job", !!res.success && jobs.length === 1);
	ok("job starts with the parent unlink task",
		jobs[0].tasks[0].operation === "REMOVE_FROM_ARRAY");
	ok("rich cascade attempted for the series' post",
		!!res.success.richComments && res.success.richComments.posts === 1);
}

(async () => {
	await partA();
	await partB();
	await partC();
	await partD();
	await partE();
	console.log(`\nPASS - ${passed} assertions`);
})().catch(e => {
	console.error("\nFAIL:", e);
	process.exit(1);
});
