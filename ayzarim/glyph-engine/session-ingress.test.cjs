// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Proves request budgets and authenticated WOFF transport at the API seam.
 * The Awtsmoos counts each font before it crosses the wire;
 * Awtsmoos.com tests what the cautious heart should require.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const { createGlyphSessionIngress } = require("./session-ingress.cjs");

/** Exchange HTTP-like requests without listening on a public socket. */
function exchange(handler, url, cookie = "", method = "GET", peer = "127.0.0.1") {
	const response = { status: 0, headers: {}, body: null };
	const outbound = {
		writeHead(status, headers) {
			response.status = status;
			response.headers = headers;
		},
		end(body) { response.body = body; }
	};
	const handled = handler({ url, method, headers: { cookie }, socket: { remoteAddress: peer } }, outbound);
	return { handled, ...response };
}

/** A tiny service makes budgets deterministic without burning real font work. */
function mockService() {
	const id = "a".repeat(48);
	const record = { id, binary: Buffer.from("wOFF"), manifest: { version: 3 } };
	let creations = 0;
	return {
		create() { creations++; return record; },
		find(value) { return value === id ? record : null; },
		created() { return creations; },
		cookie: `awg_glyph_session=${id}`
	};
}

test("new visitor receives encoded session and a secure non-cacheable cookie", () => {
	const result = exchange(createGlyphSessionIngress(), "/api/glyph-lab/session");
	assert.equal(result.handled, true);
	assert.equal(result.status, 200);
	assert.match(result.headers["Set-Cookie"], /HttpOnly; Secure; SameSite=Strict/);
	assert.match(result.headers["Cache-Control"], /no-store/);
	assert.equal(result.headers["X-Content-Type-Options"], "nosniff");
	assert.equal(result.headers["Cross-Origin-Resource-Policy"], "same-origin");
	const manifest = JSON.parse(result.body.toString());
	assert.equal(manifest.version, 3);
	assert.equal(manifest.aliases, 1944);
	assert.doesNotMatch(result.body.toString(), /[\u0590-\u05ff]/u);
});

test("font access requires exact cookie, protects WOFF and forbids duplicates", () => {
	const handler = createGlyphSessionIngress();
	const created = exchange(handler, "/api/glyph-lab/session");
	const validCookie = created.headers["Set-Cookie"].split(";")[0];
	assert.equal(exchange(handler, "/api/glyph-lab/font").status, 404);
	assert.equal(exchange(handler, "/api/glyph-lab/font", "awg_glyph_session=" + "f".repeat(48)).status, 404);
	assert.equal(exchange(handler, "/api/glyph-lab/font", `${validCookie}; ${validCookie}`).status, 404);
	const valid = exchange(handler, "/api/glyph-lab/font", validCookie);
	assert.equal(valid.status, 200);
	assert.equal(valid.body.toString("ascii", 0, 4), "wOFF");
	assert.equal(Number(valid.headers["Content-Length"]), valid.body.length);
});

test("unknown routes and methods cannot create sessions; anonymous HEAD is empty", () => {
	const service = mockService();
	const handler = createGlyphSessionIngress({ service });
	assert.equal(exchange(handler, "/api/elsewhere").handled, false);
	assert.equal(exchange(handler, "/api/glyph-lab/session", "", "POST").status, 405);
	const head = exchange(handler, "/api/glyph-lab/session", "", "HEAD");
	assert.equal(head.status, 404);
	assert.equal(head.body, undefined);
	assert.equal(service.created(), 0);
	const authorized = exchange(handler, "/api/glyph-lab/session", service.cookie, "HEAD");
	assert.equal(authorized.status, 200);
	assert.equal(authorized.body, undefined);
	assert.equal(service.created(), 0);
});

test("reader-specific session, document and font budgets return 429 and retry-after", () => {
	const service = mockService();
	const handler = createGlyphSessionIngress({
		service,
		budgetOptions: { limits: { session: 1, document: 1, font: 1 } }
	});
	assert.equal(exchange(handler, "/api/glyph-lab/session", "", "GET", "peer-a").status, 200);
	assert.equal(exchange(handler, "/api/glyph-lab/session", "", "GET", "peer-a").status, 429);
	assert.equal(exchange(handler, "/api/glyph-lab/session", "", "GET", "peer-b").status, 200);
	assert.equal(exchange(handler, "/api/glyph-lab/session", service.cookie, "GET", "peer-a").status, 200);
	const limit = exchange(handler, "/api/glyph-lab/session", service.cookie, "GET", "peer-a");
	assert.equal(limit.status, 429);
	assert.ok(Number(limit.headers["Retry-After"]) >= 1);
	assert.equal(exchange(handler, "/api/glyph-lab/font", service.cookie, "GET", "peer-a").status, 200);
	assert.equal(exchange(handler, "/api/glyph-lab/font", service.cookie, "GET", "peer-a").status, 429);
});
