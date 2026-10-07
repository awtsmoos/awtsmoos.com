// B"H
// Tests for token-scoped preview links (agent/tools/preview/previewLinks.js).
// node:test + node:assert/strict. No live browser: a real 127.0.0.1 HTTP server
// stands in for the dev server so the loopback-only proxy is exercised for real.

"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const PreviewLinks = require("../tools/preview/previewLinks.js");

function freshStateRoot() {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "preview-links-test-"));
	return dir;
}

function bearerHeaders(token) {
	return { authorization: `Bearer ${token}` };
}

/** Start a loopback-only echo server; resolves {server, port, seen}. */
function startLoopbackServer() {
	return new Promise((resolve) => {
		const seen = [];
		const server = http.createServer((req, res) => {
			let body = "";
			req.on("data", (c) => { body += c; });
			req.on("end", () => {
				seen.push({ method: req.method, url: req.url, host: req.headers.host, authorization: req.headers.authorization, cookie: req.headers.cookie, body });
				res.writeHead(200, { "content-type": "text/plain" });
				res.end(`echo:${req.method}:${req.url}`);
			});
		});
		server.listen(0, "127.0.0.1", () => {
			resolve({ server, port: server.address().port, seen });
		});
	});
}

function closeServer(server) {
	return new Promise((resolve) => server.close(resolve));
}

test("previewLinkCreate mints unguessable tokens and a well-formed URL", () => {
	const stateRoot = freshStateRoot();
	const tokens = new Set();
	const tokenIds = new Set();
	for (let i = 0; i < 200; i++) {
		const created = PreviewLinks.previewLinkCreate({ port: 3000, label: "dev", stateRoot });
		assert.equal(created.ok, true);
		assert.match(created.token, /^[0-9a-f]{64}$/, "token must be 32 random bytes as hex");
		assert.match(created.tokenId, /^pl_[0-9a-f]{24}$/);
		assert.equal(created.url, `https://awtsmoos.com/api/tunnel/preview/${created.tokenId}/`);
		assert.ok(!created.url.includes(created.token), "token must never appear in the URL");
		tokens.add(created.token);
		tokenIds.add(created.tokenId);
	}
	assert.equal(tokens.size, 200, "tokens must be unique (entropy check)");
	assert.equal(tokenIds.size, 200, "tokenIds must be unique");
});

test("previewLinkCreate rejects invalid ports", () => {
	const stateRoot = freshStateRoot();
	for (const bad of [0, -1, 65536, 1.5, NaN, "abc", "", null, undefined]) {
		assert.throws(
			() => PreviewLinks.previewLinkCreate({ port: bad, stateRoot }),
			/invalid_port/,
			`port ${String(bad)} must be rejected`
		);
	}
});

test("TTL expiry is enforced on every request and expired records are purged", async () => {
	const stateRoot = freshStateRoot();
	const { server, port } = await startLoopbackServer();
	try {
		const created = PreviewLinks.previewLinkCreate({ port, ttlMinutes: 1 / 60000, stateRoot }); // ~1ms
		await new Promise((r) => setTimeout(r, 60));
		const result = await PreviewLinks.handlePreviewLinkRequest({
			tokenId: created.tokenId,
			path: "/",
			method: "GET",
			headers: bearerHeaders(created.token),
			stateRoot
		});
		assert.equal(result.ok, false);
		assert.equal(result.error, "preview_link_expired");
		assert.equal(result.status, 410);
		// The record must be gone from the persisted store (purged, not lingering).
		const stored = JSON.parse(fs.readFileSync(path.join(stateRoot, "preview-links.json"), "utf8"));
		assert.ok(!(created.tokenId in stored.links), "expired record must be purged from disk");
	} finally {
		await closeServer(server);
	}
});

test("valid bearer token proxies to 127.0.0.1:<port> only, with normalized path", async () => {
	const stateRoot = freshStateRoot();
	const { server, port, seen } = await startLoopbackServer();
	try {
		const created = PreviewLinks.previewLinkCreate({ port, label: "vite", stateRoot });
		const result = await PreviewLinks.handlePreviewLinkRequest({
			tokenId: created.tokenId,
			path: "/some/page?x=1&y=2",
			method: "GET",
			headers: bearerHeaders(created.token),
			stateRoot
		});
		assert.equal(result.ok, true);
		assert.equal(result.status, 200);
		assert.equal(Buffer.from(result.body64, "base64").toString("utf8"), "echo:GET:/some/page?x=1&y=2");
		assert.equal(seen.length, 1);
		assert.equal(seen[0].host, `127.0.0.1:${port}`, "upstream Host must be loopback");
		assert.equal(seen[0].authorization, undefined, "bearer token must never be forwarded upstream");
	} finally {
		await closeServer(server);
	}
});

test("cookie bearer token is accepted but stripped before upstream", async () => {
	const stateRoot = freshStateRoot();
	const { server, port, seen } = await startLoopbackServer();
	try {
		const created = PreviewLinks.previewLinkCreate({ port, stateRoot });
		const result = await PreviewLinks.handlePreviewLinkRequest({
			tokenId: created.tokenId,
			path: "/",
			method: "GET",
			headers: { cookie: `other=1; awtsmoos_preview=${created.token}; z=2` },
			stateRoot
		});
		assert.equal(result.ok, true);
		assert.equal(result.status, 200);
		assert.equal(seen.length, 1);
		assert.ok(!String(seen[0].cookie || "").includes(created.token), "bearer cookie must be stripped before upstream");
		assert.ok(String(seen[0].cookie || "").includes("other=1"), "non-bearer cookies must survive");
		assert.ok(String(seen[0].cookie || "").includes("z=2"), "non-bearer cookies must survive");
		assert.equal(seen[0].authorization, undefined);
	} finally {
		await closeServer(server);
	}
});

test("path traversal is rejected and the upstream server is never contacted", async () => {
	const stateRoot = freshStateRoot();
	const { server, port, seen } = await startLoopbackServer();
	try {
		const created = PreviewLinks.previewLinkCreate({ port, stateRoot });
		const attacks = [
			"/..%2f..%2fetc/passwd",
			"/../../etc/passwd",
			"/%2e%2e/%2e%2e/secret",
			"/..%5c..%5cwindows",
			"/%00",
			"/a/%00/b",
			"/..\\..\\etc",
			"/%2e%2e%2f%2e%2e%2f"
		];
		for (const attack of attacks) {
			const result = await PreviewLinks.handlePreviewLinkRequest({
				tokenId: created.tokenId,
				path: attack,
				method: "GET",
				headers: bearerHeaders(created.token),
				stateRoot
			});
			assert.equal(result.ok, false, `attack path ${attack} must fail`);
			assert.equal(result.error, "invalid_path", `attack path ${attack} must be invalid_path`);
			assert.equal(result.status, 400);
		}
		assert.equal(seen.length, 0, "upstream must never see a rejected traversal request");
	} finally {
		await closeServer(server);
	}
});

test("revoked tokens are rejected", async () => {
	const stateRoot = freshStateRoot();
	const { server, port, seen } = await startLoopbackServer();
	try {
		const created = PreviewLinks.previewLinkCreate({ port, stateRoot });
		const revoked = PreviewLinks.previewLinkRevoke({ tokenId: created.tokenId, stateRoot });
		assert.equal(revoked.ok, true);
		assert.equal(revoked.revoked, true);
		const result = await PreviewLinks.handlePreviewLinkRequest({
			tokenId: created.tokenId,
			path: "/",
			method: "GET",
			headers: bearerHeaders(created.token),
			stateRoot
		});
		assert.equal(result.ok, false);
		assert.equal(result.error, "preview_link_revoked");
		assert.equal(result.status, 410);
		assert.equal(seen.length, 0);
	} finally {
		await closeServer(server);
	}
});

test("wrong or missing bearer tokens are rejected without echoing the token", async () => {
	const stateRoot = freshStateRoot();
	const { server, port, seen } = await startLoopbackServer();
	try {
		const created = PreviewLinks.previewLinkCreate({ port, stateRoot });
		const wrong = await PreviewLinks.handlePreviewLinkRequest({
			tokenId: created.tokenId, path: "/", method: "GET",
			headers: bearerHeaders(crypto.randomBytes(32).toString("hex")), stateRoot
		});
		assert.equal(wrong.ok, false);
		assert.equal(wrong.error, "preview_link_unauthorized");
		assert.equal(wrong.status, 403);
		const missing = await PreviewLinks.handlePreviewLinkRequest({
			tokenId: created.tokenId, path: "/", method: "GET", headers: {}, stateRoot
		});
		assert.equal(missing.ok, false);
		assert.equal(missing.error, "preview_link_unauthorized");
		const unknown = await PreviewLinks.handlePreviewLinkRequest({
			tokenId: "pl_ffffffffffffffffffffffff", path: "/", method: "GET",
			headers: bearerHeaders(created.token), stateRoot
		});
		assert.equal(unknown.ok, false);
		assert.equal(unknown.error, "preview_link_not_found");
		assert.equal(unknown.status, 404);
		for (const r of [wrong, missing, unknown]) {
			assert.ok(!JSON.stringify(r).includes(created.token), "failure payload must never echo the token");
		}
		assert.equal(seen.length, 0);
	} finally {
		await closeServer(server);
	}
});

test("previewLinkList returns metadata only -- no token values leak", () => {
	const stateRoot = freshStateRoot();
	const created = PreviewLinks.previewLinkCreate({ port: 5173, label: "vite dev", ttlMinutes: 30, stateRoot });
	const listed = PreviewLinks.previewLinkList({ stateRoot });
	assert.equal(listed.ok, true);
	assert.equal(listed.links.length, 1);
	const meta = listed.links[0];
	assert.deepEqual(Object.keys(meta).sort(), ["createdAt", "expiresAt", "label", "port", "tokenId"]);
	assert.equal(meta.tokenId, created.tokenId);
	assert.equal(meta.port, 5173);
	assert.equal(meta.label, "vite dev");
	const serialized = JSON.stringify(listed);
	assert.ok(!serialized.includes(created.token), "list must not contain the bearer token");
	const stored = JSON.parse(fs.readFileSync(path.join(stateRoot, "preview-links.json"), "utf8"));
	assert.ok(!serialized.includes(stored.links[created.tokenId].tokenSha256), "list must not contain token hashes");
});
