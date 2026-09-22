// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gateway that lets external agents call Awtsmoos application APIs.
 * @description
 * The Awtsmoos opens its application power to outsiders without handing them
 * the codebase; Awtsmoos.com binds the caller's OAuth identity (scope
 * awtsmoos.api) to the genuine server route handlers, so every application
 * authorization check still runs and no raw database path is ever exposed.
 *
 * Request shape (POST JSON):
 *   { operation: "<catalog id>", params: {heichel, series, post, ...},
 *     query: {...}, body: {...} }
 *
 * The gateway allowlists the operation against the curated catalog, builds a
 * child request context carrying the caller's identity in the exact shape the
 * application expects ($i.request.user), invokes the real route factory, and
 * returns the handler's result bounded and secret-redacted.
 */

const { bodyJson } = require("../core/bodyPayload.js");
const { currentIdentity } = require("../core/auth.js");
const { json } = require("../core/respond.js");
const { getOperation } = require("../docs/appApiCatalog.js");
const { TUNNEL_SCOPE } = require("../../shared/scopeCatalog.js");

const MAX_RESULT_CHARS = 256 * 1024;
const SECRET_KEY_RX = /^(token|refreshToken|refresh_token|accessToken|access_token|secret|clientSecret|client_secret|password|apiKey|api_key|privateKey|private_key)$/i;

function redactSecrets(value, depth = 0) {
	if (depth > 12 || value === null || value === undefined) return value;
	if (Array.isArray(value)) return value.map(item => redactSecrets(item, depth + 1));
	if (typeof value !== "object") return value;
	const out = {};
	for (const [key, item] of Object.entries(value)) {
		out[key] = SECRET_KEY_RX.test(key) ? "[redacted]" : redactSecrets(item, depth + 1);
	}
	return out;
}

function boundedResult(result) {
	const redacted = redactSecrets(result);
	const text = JSON.stringify(redacted);
	if (text.length > MAX_RESULT_CHARS) {
		return {
			BH: "B\"H",
			ok: false,
			error: "result_too_large",
			details: `Result was ${text.length} chars; the gateway bounds application results at ${MAX_RESULT_CHARS} chars. Narrow the request (fewer fields, one post at a time, details=false).`,
			operationTruncated: true
		};
	}
	return { BH: "B\"H", ok: true, result: redacted };
}

function childContext($i, identity, operation, payload) {
	const child = Object.create($i);
	const params = payload.params || {};
	const query = payload.query || {};
	const body = payload.body || {};
	child.$_GET = { ...query, ...params };
	child.$_QUERY = { ...query, ...params };
	child.paramKinds = { ...(child.paramKinds || {}), GET: child.$_GET };
	if (operation.method === "POST" || operation.method === "PUT" || operation.method === "PATCH") {
		child.$_POST = { ...body };
		child.paramKinds = { ...child.paramKinds, POST: child.$_POST };
	}
	if (operation.method === "DELETE") {
		child.$_DELETE = { ...query, ...params, ...body };
	}
	const baseRequest = ($i && $i.request) || {};
	child.request = {
		...baseRequest,
		method: operation.method,
		user: {
			loggedIn: true,
			info: {
				userId: identity.userId,
				accountId: identity.accountId,
				subject: identity.subject,
				issuer: identity.issuer
			}
		}
	};
	return { child, vars: { ...params } };
}

async function appApiCall($i) {
	const payload = bodyJson($i) || {};
	const operationId = String(payload.operation || "").trim();
	if (!operationId) {
		return json($i, { BH: "B\"H", ok: false, error: "missing_operation", details: "POST JSON body must include {\"operation\": \"<catalog-id>\"}. See GET /api/tunnel/control/app-api/catalog." }, 400);
	}
	const operation = getOperation(operationId);
	if (!operation) {
		return json($i, { BH: "B\"H", ok: false, error: "unknown_operation", details: `No cataloged application operation named "${operationId}". See GET /api/tunnel/control/app-api/catalog.` }, 404);
	}

	const identity = currentIdentity($i);
	if (!identity || !identity.ok) {
		return json($i, { BH: "B\"H", ok: false, error: "not_authenticated", details: "This gateway needs a Bearer <redacted> (OAuth client_id=external-agent) carrying the awtsmoos.api scope." }, 401);
	}
	const scopes = identity.scopes || [];
	if (!scopes.includes(TUNNEL_SCOPE.API)) {
		return json($i, { BH: "B\"H", ok: false, error: "insufficient_scope", details: "The awtsmoos.api scope is required. Re-run the OAuth device flow requesting scope \"awtsmoos.api\"." }, 403);
	}

	const missing = (operation.pathParams || []).filter(name => payload.params?.[name] === undefined || payload.params?.[name] === "");
	if (missing.length) {
		return json($i, { BH: "B\"H", ok: false, error: "missing_params", details: `Missing path params: ${missing.join(", ")}.` }, 400);
	}

	let factory;
	try {
		factory = require(operation.dispatch.module);
	} catch (error) {
		return json($i, { BH: "B\"H", ok: false, error: "dispatch_unavailable", details: `Application module for "${operationId}" could not be loaded: ${error.message}` }, 500);
	}
	if (typeof factory !== "function") {
		return json($i, { BH: "B\"H", ok: false, error: "dispatch_unavailable", details: `Application factory for "${operationId}" is not callable.` }, 500);
	}

	const { child, vars } = childContext($i, identity, operation, payload);
	let routeMap;
	try {
		routeMap = factory({ $i: child, userid: identity.userId });
	} catch (error) {
		return json($i, { BH: "B\"H", ok: false, error: "dispatch_failed", details: `Application route factory failed: ${error.message}` }, 500);
	}
	const handler = routeMap?.[operation.dispatch.route];
	if (typeof handler !== "function") {
		return json($i, { BH: "B\"H", ok: false, error: "dispatch_unavailable", details: `Route "${operation.dispatch.route}" is not served by the application right now.` }, 500);
	}

	let result;
	try {
		result = await handler(vars);
	} catch (error) {
		return json($i, { BH: "B\"H", ok: false, error: "application_error", details: String(error?.message || error) }, 500);
	}
	return json($i, boundedResult(result));
}

module.exports = { appApiCall };
