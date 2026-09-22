// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Machine-readable catalog of Awtsmoos application APIs for external agents.
 * @description
 * The Awtsmoos lets outsiders call Awtsmoos.com application power without owning
 * the codebase; Awtsmoos.com curates every exposed operation — heichelos, series,
 * posts — with method, path template, parameters, auth shape, dispatch binding,
 * and a runnable example, so discovery is data instead of folklore.
 *
 * Each operation's `dispatch` names the exact server route factory and routeMap
 * key that serves the real website, so the gateway invokes genuine application
 * behavior (including its own authorization checks) rather than a parallel copy.
 */

const OPERATIONS = Object.freeze([
	{
		id: "heichel.get",
		group: "heichelos",
		title: "Get heichel",
		method: "GET",
		path: "/heichelos/{heichel}",
		pathParams: ["heichel"],
		queryParams: [],
		bodyParams: [],
		auth: "public",
		authNote: "Public read. No alias needed.",
		description: "Read one heichel record (id, name, settings, public prateem).",
		dispatch: { module: "../../../social/_awtsmoos.heichel.js", route: "/heichelos/:heichel" },
		example: { params: { heichel: "ikar" } }
	},
	{
		id: "heichel.seriesList",
		group: "heichelos",
		title: "List root series of a heichel",
		method: "GET",
		path: "/heichelos/{heichel}/series/",
		pathParams: ["heichel"],
		queryParams: [],
		bodyParams: [],
		auth: "public",
		authNote: "Public read. No alias needed.",
		description: "List the root-level series (children of 'root'), always detailed.",
		dispatch: { module: "../../../social/_awtsmoos.series.js", route: "/heichelos/:heichel/series/" },
		example: { params: { heichel: "ikar" } }
	},
	{
		id: "heichels.byAlias",
		group: "heichelos",
		title: "List heichelos owned by an alias",
		method: "GET",
		path: "/alias/{alias}/heichelos/details",
		pathParams: ["alias"],
		queryParams: [],
		bodyParams: [],
		auth: "public",
		authNote: "Public read. Lists heichelos the alias owns.",
		description: "Detailed list of heichelos owned by the given alias id.",
		dispatch: { module: "../../../social/_awtsmoos.heichel.js", route: "/alias/:alias/heichelos/details" },
		example: { params: { alias: "likkutei" } }
	},
	{
		id: "series.get",
		group: "series",
		title: "Get series",
		method: "GET",
		path: "/heichelos/{heichel}/series/{series}",
		pathParams: ["heichel", "series"],
		queryParams: ["details"],
		bodyParams: [],
		auth: "public",
		authNote: "Public read. Pass details=true for the full detailed record.",
		description: "Read one series. Without ?details=true returns the fast packed-DB prateem read; with details=true returns the full detailed record.",
		dispatch: { module: "../../../social/_awtsmoos.series.js", route: "/heichelos/:heichel/series/:series" },
		example: { params: { heichel: "ikar", series: "likkutei-sichos" }, query: { details: "true" } }
	},
	{
		id: "series.getDetails",
		group: "series",
		title: "Get series details",
		method: "GET",
		path: "/heichelos/{heichel}/series/{series}/details",
		pathParams: ["heichel", "series"],
		queryParams: [],
		bodyParams: [],
		auth: "public",
		authNote: "Public read. No alias needed.",
		description: "Read the full detailed record of one series.",
		dispatch: { module: "../../../social/_awtsmoos.series.js", route: "/heichelos/:heichel/series/:series/details" },
		example: { params: { heichel: "ikar", series: "likkutei-sichos" } }
	},
	{
		id: "series.subSeries",
		group: "series",
		title: "List sub-series",
		method: "GET",
		path: "/heichelos/{heichel}/series/{series}/subSeries",
		pathParams: ["heichel", "series"],
		queryParams: ["details"],
		bodyParams: [],
		auth: "public",
		authNote: "Public read. No alias needed.",
		description: "List child series of one series; detailed when ?details=true.",
		dispatch: { module: "../../../social/_awtsmoos.series.js", route: "/heichelos/:heichel/series/:series/subSeries" },
		example: { params: { heichel: "ikar", series: "likkutei-sichos" } }
	},
	{
		id: "posts.list",
		group: "posts",
		title: "List posts in a series",
		method: "GET",
		path: "/heichelos/{heichel}/series/{series}/posts",
		pathParams: ["heichel", "series"],
		queryParams: [],
		bodyParams: [],
		auth: "public",
		authNote: "Public read. No alias needed.",
		description: "List posts in one series (summary form).",
		dispatch: { module: "../../../social/_awtsmoos.posts.js", route: "/heichelos/:heichel/series/:series/posts" },
		example: { params: { heichel: "ikar", series: "likkutei-sichos" } }
	},
	{
		id: "posts.listDetails",
		group: "posts",
		title: "List posts with details",
		method: "GET",
		path: "/heichelos/{heichel}/series/{series}/posts/details",
		pathParams: ["heichel", "series"],
		queryParams: [],
		bodyParams: [],
		auth: "public",
		authNote: "Public read. No alias needed.",
		description: "List posts in one series with full details.",
		dispatch: { module: "../../../social/_awtsmoos.posts.js", route: "/heichelos/:heichel/series/:series/posts/details" },
		example: { params: { heichel: "ikar", series: "likkutei-sichos" } }
	},
	{
		id: "posts.get",
		group: "posts",
		title: "Get one post",
		method: "GET",
		path: "/heichelos/{heichel}/series/{series}/post/{post}",
		pathParams: ["heichel", "series", "post"],
		queryParams: [],
		bodyParams: [],
		auth: "public",
		authNote: "Public read. No alias needed.",
		description: "Read one post (title, content, dayuh enrichment when present).",
		dispatch: { module: "../../../social/_awtsmoos.posts.js", route: "/heichelos/:heichel/series/:series/post/:post" },
		example: { params: { heichel: "ikar", series: "likkutei-sichos", post: "<post-id>" } }
	},
	{
		id: "posts.create",
		group: "posts",
		title: "Create a post",
		method: "POST",
		path: "/heichelos/{heichel}/series/{series}/posts",
		pathParams: ["heichel", "series"],
		queryParams: [],
		bodyParams: ["aliasId", "title", "content", "dayuh"],
		auth: "alias",
		authNote: "Requires login plus an aliasId with posting authority in the heichel. The aliasId must belong to the caller's account; heichel approval settings may route the post to a submission queue instead of publishing directly.",
		description: "Add a post to a series. Title max 100 chars, content max 15784 chars.",
		dispatch: { module: "../../../social/_awtsmoos.posts.js", route: "/heichelos/:heichel/series/:series/posts" },
		example: {
			params: { heichel: "ikar", series: "likkutei-sichos" },
			body: { aliasId: "<your-alias>", title: "New post", content: "Body text." }
		}
	},
	{
		id: "posts.update",
		group: "posts",
		title: "Edit a post",
		method: "PUT",
		path: "/heichelos/{heichel}/series/{series}/post/{post}",
		pathParams: ["heichel", "series", "post"],
		queryParams: [],
		bodyParams: ["aliasId", "title", "content", "dayuh"],
		auth: "alias",
		authNote: "Requires login plus an aliasId with ikar heichel authority for the post. Only title/content/dayuh are writable; all other fields are preserved by the server.",
		description: "Edit a post in a series (safe merge: re-fetch, hash-compare, merge enrichment only, write, re-verify).",
		dispatch: { module: "../../../social/_awtsmoos.posts.js", route: "/heichelos/:heichel/series/:series/post/:post" },
		example: {
			params: { heichel: "ikar", series: "likkutei-sichos", post: "<post-id>" },
			body: { aliasId: "<your-alias>", dayuh: { translation: "..." } }
		}
	},
	{
		id: "posts.delete",
		group: "posts",
		title: "Delete a post",
		method: "DELETE",
		path: "/heichelos/{heichel}/series/{series}/post/{post}",
		pathParams: ["heichel", "series", "post"],
		queryParams: ["aliasId"],
		bodyParams: [],
		auth: "alias",
		authNote: "Requires login plus the aliasId that owns the post (or heichel authority).",
		description: "Delete a post from a series.",
		dispatch: { module: "../../../social/_awtsmoos.posts.js", route: "/heichelos/:heichel/series/:series/post/:post" },
		example: { params: { heichel: "ikar", series: "likkutei-sichos", post: "<post-id>", aliasId: "<your-alias>" } }
	}
]);

const GROUPS = Object.freeze([
	{ id: "heichelos", title: "Heichelos", summary: "Heichel records and alias-owned heichel lists." },
	{ id: "series", title: "Series", summary: "Series reads: single, detailed, and sub-series." },
	{ id: "posts", title: "Posts", summary: "Post reads plus alias-authorized create, edit, and delete." }
]);

function getOperation(id) {
	return OPERATIONS.find(op => op.id === id) || null;
}

function catalogBody() {
	return {
		BH: "B\"H",
		ok: true,
		name: "Awtsmoos Application API Catalog",
		version: "1.0.0",
		scope: "awtsmoos.api",
		base: "https://awtsmoos.com",
		callEndpoint: "https://awtsmoos.com/api/tunnel/control/app-api/call",
		catalogEndpoint: "https://awtsmoos.com/api/tunnel/control/app-api/catalog",
		howToCall: {
			auth: "Bearer <redacted> with scope awtsmoos.api (OAuth client_id=external-agent, device flow).",
			shape: 'POST {callEndpoint} with JSON body {"operation": "<operation-id>", "params": {...}, "query": {...}, "body": {...}}.',
			identity: "The gateway binds your OAuth identity to the call; write operations additionally require an aliasId you own.",
			limits: "Responses are bounded; oversized results return a truncation notice instead of silent cuts."
		},
		groups: GROUPS,
		operationCount: OPERATIONS.length,
		operations: OPERATIONS
	};
}

module.exports = {
	GROUPS,
	OPERATIONS,
	catalogBody,
	getOperation
};
