// B"H — The Awtsmoos opens wisdom, never a borrowed owner's mailbox.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Validation = require("./publicReadValidation.js");
const Tool = require("./publicReadTool.js");
const Transport = require("./httpTransport.js");
const Rate = require("./httpRateLimit.js");
const Catalog = require("./toolCatalog.js");
const Invocation = require("./toolInvocation.js");

const guest = accountId => ({ accountId, scopes: ["tunnel.read"] });

/** Prove each public URL is a fixed read-only family, never arbitrary routing. */
test("public search, Heichelos and Ask have exact allowlisted paths", () => {
	const expected = [
		[{ action: "search", query: "Torah" }, "/api/social/search/library/query", "GET"],
		[{ action: "search_exact", query: "תורה" }, "/api/social/search/exact/hebrew", "GET"],
		[{ action: "heichel", heichel: "ikar" }, "/api/social/heichelos/ikar", "GET"],
		[{ action: "heichelos_by_alias", alias: "owner" }, "/api/social/alias/owner/heichelos/details", "GET"],
		[{ action: "series", heichel: "ikar", series: "root" }, "/api/social/heichelos/ikar/series/root", "GET"],
		[{ action: "posts", heichel: "ikar", series: "root" }, "/api/social/heichelos/ikar/series/root/posts", "GET"],
		[{ action: "post", heichel: "ikar", series: "root", post: "abc" }, "/api/social/heichelos/ikar/series/root/post/abc", "GET"],
		[{ action: "ask", question: "Shalom?" }, "/ask/api", "POST"],
		[{ action: "ask_sources" }, "/ask/api", "POST"]
	];
	for (const [request, path, method] of expected) {
		const output = Validation.prepare(request);
		assert.equal(output.url.pathname, path);
		assert.equal(output.method, method);
		assert.equal(output.url.hostname, "awtsmoos.com");
	}
	assert.deepEqual(JSON.parse(Validation.prepare({ action: "ask_sources" }).body), { action: "collections" });
	assert.equal(JSON.parse(Validation.prepare({ action: "ask", question: "Why?", session: "test-1" }).body).session, "test-1");
});

/** Refuse arbitrary administrative Ask operations or content writing via guest. */
test("guest cannot smuggle index, mail, post mutation or malformed text", () => {
	for (const request of [
		{ action: "index" }, { action: "mail.send" }, { action: "create_post" },
		{ action: "ask", question: "" }, { action: "ask", question: "a".repeat(1001) },
		{ action: "ask", question: "hey", sources: ["/../../private"] },
		{ action: "ask", question: "hey", session: "../bad" },
		{ action: "heichel", heichel: "../secret" },
		{ action: "post", heichel: "ikar", series: "root", post: "%2e%2e" },
		{ action: "search", query: "hello", limit: 400 }
	]) assert.throws(() => Validation.prepare(request), undefined, JSON.stringify(request));
});

test("plugin OAuth tunnel.read needed, but guest needs no website/session or awtsmoos.api scope", async () => {
	const saved = Transport.send;
	let calls = 0;
	Transport.send = async payload => {
		calls += 1;
		assert.equal(payload.headers.cookie, undefined);
		assert.equal(payload.headers.authorization, undefined);
		return { ok: true, statusCode: 200, body: { public: true } };
	};
	try {
		Rate.resetForTests();
		assert.equal((await Tool.request({}, { accountId: "a", scopes: [] }, { action: "heichel", heichel: "ikar" })).statusCode, 403);
		assert.equal((await Tool.request({}, null, { action: "heichel", heichel: "ikar" })).statusCode, 403);
		const result = await Tool.request({}, guest("a"), { action: "heichel", heichel: "ikar" });
		assert.equal(result.ok, true);
		assert.equal(calls, 1);
	} finally { Transport.send = saved; }
});

test("300 concurrent synthetic calls stay inside independent account/host budgets", async () => {
	const saved = Transport.send;
	let admitted = 0;
	Transport.send = async payload => {
		assert.equal(payload.method, "GET");
		admitted += 1;
		return { ok: true, statusCode: 200, body: [] };
	};
	try {
		Rate.resetForTests();
		const operations = Array.from({ length: 300 }, (_, index) =>
			Tool.request({}, guest("account-" + Math.floor(index / 30)), { action: "heichel", heichel: "ikar" }));
		const replies = await Promise.all(operations);
		assert.equal(replies.filter(item => item.ok).length, 120);
		assert.equal(replies.filter(item => item.statusCode === 429).length, 180);
		assert.equal(admitted, 120);
		assert.ok(replies.filter(item => item.statusCode === 429).every(item => item.retryAfterSeconds >= 1));
	} finally { Transport.send = saved; }
});

test("new public tool appears exactly once through MCP dispatcher", async () => {
	const names = Catalog.tools.map(item => item.name);
	assert.equal(names.filter(name => name === "awtsmoos_public_query").length, 1);
	assert.equal(new Set(names).size, names.length);
	assert.equal(typeof Invocation.handlerFor("awtsmoos_public_query"), "function");
	const denied = await Invocation.call({}, { accountId: "a", scopes: [] },
		{ name: "awtsmoos_public_query", arguments: { action: "heichel", heichel: "ikar" } });
	assert.equal(denied.structuredContent.statusCode, 403);
	assert.equal(denied.isError, true);
});
