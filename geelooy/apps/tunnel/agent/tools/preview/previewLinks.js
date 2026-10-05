// B"H
// Boruch Hashem

/**
 * @file Token-scoped preview links: open private Mac localhost servers in an internal browser.
 *
 * @description
 * The user asked: "Always implement preview links so you can open private localhost serves
 * from my Mac in your own internal browser and stuff." A preview link lets the assistant's
 * own internal browser reach a private `localhost:<port>` dev server running on this Mac
 * through `https://awtsmoos.com/api/tunnel/preview/<tokenId>/<path...>`.
 *
 * This is deliberately NOT the public-doorway preview family in
 * `agent/tools/fs/preview/` (localServerAction / previewRegistry / publicProbe), which
 * publishes a server behind API-key auth and probes it. Preview links are narrower:
 * short-lived, single-port, bearer-token capabilities for the assistant's own browser.
 *
 * @security DESIGN (all enforced below)
 * - Bearer token: `crypto.randomBytes(32)` -> 64 hex chars (256 bits, unguessable).
 * - Public routing id (`tokenId`): `pl_` + 24 hex chars (96 bits). Routing only, NOT a secret.
 * - The secret token is returned ONLY in the `previewLinkCreate` response. It NEVER
 *   appears in a URL afterwards, is NEVER logged (only the `tokenId` is logged), and is
 *   NEVER persisted in the clear: the on-disk record stores only `tokenSha256`.
 * - The browser presents the token per request as `Authorization: Bearer <token>` or the
 *   `awtsmoos_preview` cookie. Comparison is constant-time over the SHA-256 digests.
 * - TTL is enforced on EVERY request; expired records are purged (in-memory map and the
 *   persisted JSON file). Default 30 minutes, hard cap 24 hours.
 * - The upstream is ALWAYS `127.0.0.1:<port>` -- the handler cannot be steered at any
 *   other host. `port` must be an integer 1-65535.
 * - The proxied path is normalized and traversal-proof: null bytes, backslashes,
 *   percent-encoded `..` (`%2e%2e`, `%2f`), and `..` segments are rejected with
 *   `invalid_path` before any upstream contact. The upstream server provably never sees
 *   a rejected request (covered by test).
 * - Revocation is immediate and durable (`previewLinkRevoke`).
 *
 * @security THREAT MODEL (honest version)
 * - The relay at awtsmoos.com is UNTRUSTED TRANSPORT: it necessarily sees the bearer
 *   token in the headers it forwards. Mitigations: short TTL (default 30 min), instant
 *   revocation, no token in URLs (keeps it out of logs / history / Referer), token
 *   stored on the Mac only as SHA-256, and TLS between browser and relay.
 * - Residual risk: a relay operator (or anyone who captures the token in flight) can
 *   replay it until it expires or is revoked. This is inherent to bearer tokens and is
 *   why TTLs are short and revocation exists. Do NOT use preview links for anything
 *   that must survive relay compromise; rotate/revoke aggressively.
 * - The Mac agent is the SOLE authority on authentication. The relay must never mint,
 *   validate, or cache token decisions.
 *
 * @security RELAY CONTRACT (what `awtsmoos.com` must implement for
 * `ALL /api/tunnel/preview/:tokenId/*`; no relay-side code exists in-repo yet)
 * 1. Match `ALL /api/tunnel/preview/<tokenId>` and `/api/tunnel/preview/<tokenId>/*`.
 *    Validate `tokenId` matches `^pl_[0-9a-f]{24}$`; anything else -> 404 (do not
 *    forward; do not distinguish reasons to the client).
 * 2. Strip the `/api/tunnel/preview` prefix and forward to the Mac agent over the
 *    established tunnel websocket as:
 *      `{ action: "previewLinkProxy", tokenId, path: "/<subpath>?<query>",
 *         method, headers, body64, responseBodyMode: "base64" }`
 *    exactly like the existing `previewProxy`'s `{action:"httpRequest",...}` envelope
 *    (`geelooy/api/tunnel/control/routes/previewProxy.js`): forward `method`,
 *    full sub-path + query, ALL headers (including `Authorization` and `Cookie`),
 *    and the raw body (base64). Bounded timeout (30s), bounded response (16MB).
 * 3. MUST NOT log `Authorization` / `Cookie` header values, MUST NOT log the token,
 *    MUST NOT cache responses, MUST NOT follow redirects itself (pass 3xx through),
 *    MUST strip hop-by-hop headers on the way back.
 * 4. Map the agent's `{ok:false, status, error}` reply to the HTTP response verbatim.
 *    Never substitute its own auth decision.
 * 5. The relay needs NO secret and stores NO token state. All token state lives on
 *    the Mac (this module).
 *
 * @example
 * const PreviewLinks = require("./previewLinks.js");
 * const created = PreviewLinks.previewLinkCreate({ port: 3000, label: "vite dev", ttlMinutes: 30 });
 * // -> { ok:true, url:"https://awtsmoos.com/api/tunnel/preview/pl_.../", tokenId:"pl_...",
 * //      token:"<64 hex, handle once>", expiresAt:"...", ... }
 * // The assistant's internal browser opens `created.url` with the token as
 * // `Authorization: Bearer <token>` (or the `awtsmoos_preview` cookie).
 */

"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

const RELAY_PREVIEW_BASE = "https://awtsmoos.com/api/tunnel/preview";
const TOKEN_BYTES = 32; // 256-bit bearer token
const TOKEN_ID_BYTES = 12; // 96-bit public routing id
const TOKEN_ID_RE = /^pl_[0-9a-f]{24}$/;
const DEFAULT_TTL_MINUTES = 30;
const MAX_TTL_MINUTES = 24 * 60;
const MIN_TTL_MINUTES = 1 / 60000; // ~1ms floor so tests can force expiry
const UPSTREAM_TIMEOUT_MS = 30000;
const MAX_UPSTREAM_BYTES = 16 * 1024 * 1024;
const BEARER_COOKIE_NAME = "awtsmoos_preview";
const ALLOWED_METHODS = new Set(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]);
const STORE_FILE_NAME = "preview-links.json";
const HOP_BY_HOP = new Set([
	"connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
	"te", "trailer", "transfer-encoding", "upgrade", "host", "content-length"
]);

// ---------------------------------------------------------------------------
// Token store: in-memory read-through + persisted JSON (atomic write, 0600).
// Only tokenSha256 is persisted -- the raw token never touches disk.
// ---------------------------------------------------------------------------

/**
 * Default on-disk home for preview-link records (outside the replaceable runtime).
 * @returns {string}
 */
function defaultStateRoot() {
	return path.join(os.homedir(), ".awtsmoos", "preview-links");
}

/**
 * @param {string} [stateRoot]
 * @returns {string} Absolute path of the JSON store file.
 */
function stateFile(stateRoot) {
	return path.join(stateRoot || defaultStateRoot(), STORE_FILE_NAME);
}

function readState(stateRoot) {
	const file = stateFile(stateRoot);
	try {
		const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
		const links = parsed && typeof parsed === "object" && parsed.links && typeof parsed.links === "object"
			? parsed.links
			: {};
		return { version: 1, links };
	} catch {
		return { version: 1, links: {} };
	}
}

function writeState(stateRoot, state) {
	const file = stateFile(stateRoot);
	fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
	const temporary = `${file}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
	fs.chmodSync(temporary, 0o600);
	fs.renameSync(temporary, file);
}

/**
 * Remove expired records from a state object.
 * @returns {boolean} true when anything was purged.
 */
function purgeExpired(state, nowMs = Date.now()) {
	let purged = false;
	for (const [tokenId, record] of Object.entries(state.links || {})) {
		if (!record || typeof record.expiresAt !== "string" || nowMs >= Date.parse(record.expiresAt)) {
			delete state.links[tokenId];
			purged = true;
		}
	}
	return purged;
}

// ---------------------------------------------------------------------------
// Minting / validation primitives
// ---------------------------------------------------------------------------

function sha256Hex(value) {
	return crypto.createHash("sha256").update(String(value), "utf8").digest("hex");
}

/** Constant-time compare of two 64-char hex digests. */
function digestsEqualHex(left, right) {
	const a = Buffer.from(String(left), "hex");
	const b = Buffer.from(String(right), "hex");
	if (a.length !== b.length || a.length === 0) return false;
	return crypto.timingSafeEqual(a, b);
}

/**
 * @param {*} port
 * @returns {number} Validated port.
 * @throws {Error} `invalid_port` when the port is not an integer 1-65535.
 */
function validatePort(port) {
	const n = typeof port === "string" && port.trim() !== "" ? Number(port) : port;
	if (!Number.isInteger(n) || n < 1 || n > 65535) {
		throw new Error("invalid_port");
	}
	return n;
}

function clampTtl(ttlMinutes) {
	const n = Number(ttlMinutes);
	const ttl = Number.isFinite(n) ? n : DEFAULT_TTL_MINUTES;
	if (ttl <= 0) return MIN_TTL_MINUTES;
	return Math.min(ttl, MAX_TTL_MINUTES);
}

/**
 * Normalize a requested sub-path for the upstream loopback server.
 * Rejects traversal, null bytes, backslashes, and absolute-path escapes.
 * @param {string} rawPath e.g. "/a/b?x=1"
 * @returns {string} Normalized "/path?query" safe to append to the upstream URL.
 * @throws {Error} `invalid_path` on any suspicious input.
 */
function normalizeProxyPath(rawPath) {
	let p = rawPath == null ? "/" : String(rawPath);
	if (p === "") p = "/";
	if (p.includes("\0")) throw new Error("invalid_path");
	const queryIndex = p.indexOf("?");
	const query = queryIndex >= 0 ? p.slice(queryIndex) : "";
	p = queryIndex >= 0 ? p.slice(0, queryIndex) : p;
	if (query.includes("\0")) throw new Error("invalid_path");
	if (p.includes("\\")) throw new Error("invalid_path");
	let decoded;
	try {
		decoded = decodeURIComponent(p);
	} catch {
		throw new Error("invalid_path");
	}
	if (decoded.includes("\0") || decoded.includes("\\")) throw new Error("invalid_path");
	const out = [];
	for (const segment of decoded.split("/")) {
		if (segment === "" || segment === ".") continue;
		if (segment === "..") throw new Error("invalid_path");
		out.push(segment);
	}
	const normalized = `/${out.join("/")}`;
	if (!normalized.startsWith("/")) throw new Error("invalid_path");
	return normalized + query;
}

/**
 * Pull the bearer token from `Authorization: Bearer ...` or the preview cookie.
 * Header/cookie VALUES are never logged by this module.
 * @param {object} headers Node-style headers object (any case).
 * @returns {string} The presented token, or "" when absent.
 */
function extractBearerToken(headers = {}) {
	const lowered = {};
	for (const [key, value] of Object.entries(headers || {})) {
		lowered[String(key).toLowerCase()] = value;
	}
	const authorization = String(lowered.authorization || "");
	const bearer = /^bearer\s+(.+)$/i.exec(authorization.trim());
	if (bearer) return bearer[1].trim();
	const cookie = String(lowered.cookie || "");
	for (const part of cookie.split(";")) {
		const eq = part.indexOf("=");
		if (eq < 0) continue;
		if (part.slice(0, eq).trim() !== BEARER_COOKIE_NAME) continue;
		try {
			return decodeURIComponent(part.slice(eq + 1).trim());
		} catch {
			return part.slice(eq + 1).trim();
		}
	}
	return "";
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Mint a preview link for a private localhost server on this Mac.
 * The returned `token` is the ONLY time the secret is ever transmitted: hand it to
 * the internal browser (Authorization header or `awtsmoos_preview` cookie) and do
 * not log it, persist it, or place it in a URL.
 *
 * @param {object} args
 * @param {number|string} args.port Local port of the server (integer 1-65535).
 * @param {string} [args.label] Human label, metadata only.
 * @param {number} [args.ttlMinutes=30] Lifetime in minutes (capped at 24h).
 * @param {string} [args.stateRoot] Override for the JSON store directory (tests).
 * @returns {{ok:true, action:string, url:string, tokenId:string, token:string,
 *           port:number, label:string, createdAt:string, expiresAt:string}}
 * @throws {Error} `invalid_port` on a bad port.
 */
function previewLinkCreate({ port, label, ttlMinutes, stateRoot } = {}) {
	const cleanPort = validatePort(port);
	const ttl = clampTtl(ttlMinutes);
	const nowMs = Date.now();
	const token = crypto.randomBytes(TOKEN_BYTES).toString("hex");
	const tokenId = `pl_${crypto.randomBytes(TOKEN_ID_BYTES).toString("hex")}`;
	const record = {
		tokenId,
		tokenSha256: sha256Hex(token),
		port: cleanPort,
		label: String(label ?? "").slice(0, 120),
		createdAt: new Date(nowMs).toISOString(),
		expiresAt: new Date(nowMs + ttl * 60000).toISOString(),
		revokedAt: null
	};
	const state = readState(stateRoot);
	purgeExpired(state, nowMs);
	state.links[tokenId] = record;
	writeState(stateRoot, state);
	return {
		ok: true,
		action: "previewLinkCreate",
		url: `${RELAY_PREVIEW_BASE}/${tokenId}/`,
		tokenId,
		token,
		port: cleanPort,
		label: record.label,
		createdAt: record.createdAt,
		expiresAt: record.expiresAt
	};
}

/**
 * Authenticate one proxied request against the token store.
 * TTL is enforced and expired records are purged on every call.
 * @private
 */
function authenticate({ tokenId, presentedToken, stateRoot }) {
	const id = String(tokenId || "");
	if (!TOKEN_ID_RE.test(id)) return { ok: false, status: 404, error: "preview_link_not_found" };
	const state = readState(stateRoot);
	const nowMs = Date.now();
	if (purgeExpired(state, nowMs)) writeState(stateRoot, state);
	const record = state.links[id];
	if (!record) return { ok: false, status: 404, error: "preview_link_not_found" };
	if (record.revokedAt) return { ok: false, status: 410, error: "preview_link_revoked" };
	if (nowMs >= Date.parse(record.expiresAt)) {
		delete state.links[id];
		writeState(stateRoot, state);
		return { ok: false, status: 410, error: "preview_link_expired" };
	}
	const presented = String(presentedToken || "");
	if (!presented || !digestsEqualHex(sha256Hex(presented), record.tokenSha256)) {
		return { ok: false, status: 403, error: "preview_link_unauthorized" };
	}
	return { ok: true, record };
}

/**
 * Revoke a preview link immediately. The record is removed from the store, so any
 * in-flight bearer token stops working on the next request.
 * @param {object} args
 * @param {string} args.tokenId
 * @param {string} [args.stateRoot]
 * @returns {{ok:true, action:string, tokenId:string, revoked:boolean}}
 */
function previewLinkRevoke({ tokenId, stateRoot } = {}) {
	const id = String(tokenId || "");
	const state = readState(stateRoot);
	purgeExpired(state);
	const existed = Boolean(state.links[id]);
	if (existed) {
		delete state.links[id];
		writeState(stateRoot, state);
	}
	return { ok: true, action: "previewLinkRevoke", tokenId: id, revoked: existed };
}

/**
 * List active preview links. METADATA ONLY -- token values and token hashes are
 * never included, so this result is safe to log and display.
 * @param {object} args
 * @param {string} [args.stateRoot]
 * @returns {{ok:true, action:string, links:Array<{tokenId:string, port:number,
 *           label:string, createdAt:string, expiresAt:string}>}}
 */
function previewLinkList({ stateRoot } = {}) {
	const state = readState(stateRoot);
	const nowMs = Date.now();
	if (purgeExpired(state, nowMs)) writeState(stateRoot, state);
	const links = Object.values(state.links)
		.filter((record) => record && !record.revokedAt)
		.map((record) => ({
			tokenId: record.tokenId,
			port: record.port,
			label: record.label,
			createdAt: record.createdAt,
			expiresAt: record.expiresAt
		}))
		.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
	return { ok: true, action: "previewLinkList", links };
}

function failurePayload(status, error, tokenId) {
	// Only the tokenId (public routing id) is ever surfaced; the bearer token is not.
	return { ok: false, status, error, tokenId: String(tokenId || "") };
}

function filteredUpstreamHeaders(headers = {}) {
	const out = {};
	for (const [key, value] of Object.entries(headers || {})) {
		const name = String(key).toLowerCase();
		if (HOP_BY_HOP.has(name)) continue;
		if (name === "cookie") {
			// Strip the bearer cookie before it reaches the dev server; keep the rest.
			const kept = String(value)
				.split(";")
				.filter((part) => part.slice(0, part.indexOf("=")).trim() !== BEARER_COOKIE_NAME)
				.join(";")
				.trim();
			if (kept) out[name] = kept;
			continue;
		}
		if (name === "authorization") continue; // never forward the bearer upstream
		out[name] = value;
	}
	return out;
}

/**
 * Proxy one authenticated request to `http://127.0.0.1:<port><path>`.
 * The upstream host is FIXED to loopback -- no request can be steered elsewhere.
 * @private
 */
function proxyToLoopback(port, method, proxyPath, headers, body64) {
	return new Promise((resolve) => {
		let body = null;
		if (typeof body64 === "string" && body64 !== "") {
			try {
				body = Buffer.from(body64, "base64");
			} catch {
				return resolve({ ok: false, status: 400, error: "invalid_body" });
			}
		}
		const upstreamHeaders = filteredUpstreamHeaders(headers);
		upstreamHeaders.host = `127.0.0.1:${port}`;
		if (body) upstreamHeaders["content-length"] = String(body.length);
		const request = http.request(
			{ host: "127.0.0.1", port, path: proxyPath, method, headers: upstreamHeaders, timeout: UPSTREAM_TIMEOUT_MS },
			(upstream) => {
				const chunks = [];
				let bytes = 0;
				let tooLarge = false;
				upstream.on("data", (chunk) => {
					if (tooLarge) return;
					bytes += chunk.length;
					if (bytes > MAX_UPSTREAM_BYTES) {
						tooLarge = true;
						request.destroy();
						return resolve({ ok: false, status: 502, error: "upstream_response_too_large" });
					}
					chunks.push(chunk);
				});
				upstream.on("end", () => {
					if (tooLarge) return;
					const responseHeaders = {};
					for (const [key, value] of Object.entries(upstream.headers || {})) {
						if (HOP_BY_HOP.has(String(key).toLowerCase())) continue;
						responseHeaders[key] = value;
					}
					resolve({
						ok: true,
						status: upstream.statusCode || 200,
						headers: responseHeaders,
						body64: Buffer.concat(chunks).toString("base64")
					});
				});
				upstream.on("error", () => resolve({ ok: false, status: 502, error: "upstream_error" }));
			}
		);
		request.on("timeout", () => {
			request.destroy();
			resolve({ ok: false, status: 504, error: "upstream_timeout" });
		});
		request.on("error", () => resolve({ ok: false, status: 502, error: "upstream_unreachable" }));
		if (body) request.write(body);
		request.end();
	});
}

/**
 * Handle one relayed preview request (plain-data form, for the tunnel dispatcher).
 * The relay calls this via `{action:"previewLinkProxy", tokenId, path, method,
 * headers, body64}`; see the RELAY CONTRACT in this file's header.
 *
 * Every request re-validates: tokenId format -> record exists -> not revoked ->
 * not expired (purge) -> bearer token constant-time check -> path normalization ->
 * loopback-only proxy. Failures return `{ok:false, status, error}` with the
 * `tokenId` only -- the bearer token value is never echoed or logged.
 *
 * @param {object} args
 * @param {string} args.tokenId Public routing id from the URL path.
 * @param {string} [args.path="/"] Sub-path + query after the tokenId.
 * @param {string} [args.method="GET"]
 * @param {object} [args.headers] Request headers (any case).
 * @param {string} [args.body64] Base64 request body, if any.
 * @param {string} [args.stateRoot]
 * @returns {Promise<{ok:true,status:number,headers:object,body64:string} |
 *                   {ok:false,status:number,error:string,tokenId:string}>}
 */
async function handlePreviewLinkRequest({ tokenId, path: rawPath, method, headers, body64, stateRoot } = {}) {
	const httpMethod = String(method || "GET").toUpperCase();
	if (!ALLOWED_METHODS.has(httpMethod)) {
		return failurePayload(405, "method_not_allowed", tokenId);
	}
	const auth = authenticate({ tokenId, presentedToken: extractBearerToken(headers), stateRoot });
	if (!auth.ok) return failurePayload(auth.status, auth.error, tokenId);
	let proxyPath;
	try {
		proxyPath = normalizeProxyPath(rawPath);
	} catch {
		return failurePayload(400, "invalid_path", tokenId);
	}
	return proxyToLoopback(auth.record.port, httpMethod, proxyPath, headers, body64);
}

/**
 * Build a Node `(req, res) =>` handler for the relay to call directly when the
 * relay and the agent share a process (or for local testing). Expects the relay
 * to have stripped the `/api/tunnel/preview` prefix, so `req.url` looks like
 * `/<tokenId>/<subpath>?<query>`.
 * @param {object} args
 * @param {string} [args.stateRoot]
 * @returns {(req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse) => Promise<void>}
 */
function createProxyHandler({ stateRoot } = {}) {
	return async (req, res) => {
		try {
			const rawUrl = String(req.url || "/");
			const queryIndex = rawUrl.indexOf("?");
			const pathname = queryIndex >= 0 ? rawUrl.slice(0, queryIndex) : rawUrl;
			const query = queryIndex >= 0 ? rawUrl.slice(queryIndex) : "";
			const match = /^\/([A-Za-z0-9_-]+)(\/.*)?$/.exec(pathname);
			const chunks = [];
			for await (const chunk of req) chunks.push(chunk);
			const body64 = chunks.length ? Buffer.concat(chunks).toString("base64") : "";
			if (!match) {
				res.writeHead(404, { "content-type": "application/json" });
				res.end(JSON.stringify({ ok: false, status: 404, error: "preview_link_not_found", tokenId: "" }));
				return;
			}
			const result = await handlePreviewLinkRequest({
				tokenId: match[1],
				path: `${match[2] || "/"}${query}`,
				method: req.method,
				headers: req.headers,
				body64,
				stateRoot
			});
			if (!result.ok) {
				res.writeHead(result.status, { "content-type": "application/json" });
				res.end(JSON.stringify(result));
				return;
			}
			res.writeHead(result.status, result.headers || {});
			res.end(result.body64 ? Buffer.from(result.body64, "base64") : "");
		} catch {
			// Never leak internals (or tokens) in a 500 body.
			res.writeHead(500, { "content-type": "application/json" });
			res.end(JSON.stringify({ ok: false, status: 500, error: "preview_link_error", tokenId: "" }));
		}
	};
}

module.exports = {
	RELAY_PREVIEW_BASE,
	BEARER_COOKIE_NAME,
	DEFAULT_TTL_MINUTES,
	MAX_TTL_MINUTES,
	previewLinkCreate,
	previewLinkRevoke,
	previewLinkList,
	handlePreviewLinkRequest,
	createProxyHandler,
	defaultStateRoot,
	// Internals exported for white-box tests only; not part of the public contract.
	__internals: { normalizeProxyPath, extractBearerToken, validatePort, authenticate, sha256Hex, TOKEN_ID_RE }
};
