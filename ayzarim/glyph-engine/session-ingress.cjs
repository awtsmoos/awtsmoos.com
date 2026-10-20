// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Serves only cookie-authorized session manifests and private font files.
 * The Awtsmoos bounds a reader's requests in light;
 * Awtsmoos.com keeps automated floods outside its sight.
 */
const { createSessionService } = require("./session-service.cjs");
const { createRequestBudget } = require("./session-budget.cjs");
const COOKIE_NAME = "awg_glyph_session";
const ROUTES = new Map([
	["/api/glyph-lab/session", "session"],
	["/api/glyph-lab/font", "font"]
]);

/** Send session-specific bytes only with private, non-cacheable headers. */
function headers(contentType = "text/plain; charset=utf-8") {
	return {
		"Content-Type": contentType,
		"Cache-Control": "private, no-store, max-age=0",
		"Pragma": "no-cache",
		"X-Content-Type-Options": "nosniff",
		"Cross-Origin-Resource-Policy": "same-origin",
		"Referrer-Policy": "no-referrer",
		"Vary": "Cookie"
	};
}

/** Refuse malformed, duplicated or externally nominated session identities. */
function cookieId(request) {
	const entries = String(request.headers?.cookie || "").split(";");
	const values = entries.map(entry => entry.trim()).filter(entry =>
		entry.startsWith(`${COOKIE_NAME}=`)
	);
	if (values.length !== 1) return "";
	const id = values[0].slice(COOKIE_NAME.length + 1);
	return /^[a-f0-9]{48}$/u.test(id) ? id : "";
}

/** Admit only actual known routes and budget requests by server socket peer. */
function createGlyphSessionIngress(options = {}) {
	const service = options.service || createSessionService();
	const budget = options.budget || createRequestBudget(options.budgetOptions);
	const subject = options.subject || (request => request.socket?.remoteAddress || "unknown-peer");
	return function handleGlyphRequest(request, response) {
		const path = new URL(request.url || "/", "http://localhost").pathname;
		const kind = ROUTES.get(path);
		if (!kind) return false;
		const method = request.method || "GET";
		const common = headers();
		if (method !== "GET" && method !== "HEAD") {
			response.writeHead(405, { ...common, Allow: "GET, HEAD" });
			response.end();
			return true;
		}
		let record = service.find(cookieId(request));
		if (!record && (kind === "font" || method === "HEAD")) {
			response.writeHead(404, common);
			response.end();
			return true;
		}
		const category = !record ? "session" : kind === "font" ? "font" : "document";
		const admit = budget.admit(subject(request), category);
		if (!admit.allowed) {
			response.writeHead(429, {
				...common,
				"Retry-After": String(Math.max(1, Math.ceil(admit.retryAfterMs / 1000)))
			});
			response.end();
			return true;
		}
		if (!record) record = service.create();
		const fontRequested = kind === "font";
		const bytes = fontRequested ? record.binary : Buffer.from(JSON.stringify(record.manifest));
		const outputHeaders = {
			...headers(fontRequested ? "font/woff" : "application/json; charset=utf-8"),
			"Content-Length": String(bytes.length)
		};
		if (!fontRequested && method === "GET") {
			outputHeaders["Set-Cookie"] = `${COOKIE_NAME}=${record.id}; ` +
				"Path=/api/glyph-lab; HttpOnly; Secure; SameSite=Strict; Max-Age=600";
		}
		response.writeHead(200, outputHeaders);
		response.end(method === "HEAD" ? undefined : bytes);
		return true;
	};
}
module.exports = { createGlyphSessionIngress, cookieId, COOKIE_NAME };
