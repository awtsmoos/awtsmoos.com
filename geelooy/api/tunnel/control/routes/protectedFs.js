// B"H
// Boruch Hashem
// Blessed is He

const { currentIdentity } = require("../core/auth.js");
const { enforceApiKeyRate, scopeAllowed } = require("../core/apiKeyStore.js");
const { recordUsage } = require("../core/usageStore.js");
const { json } = require("../core/respond.js");
const { autoCreatePreviewResult } = require("../preview/previewAutoCreate.js");
const { resolveFsVessel } = require("./fsVessel/resolveFsVessel.js");
const Policy = require("./protectedFsPolicy.js");

/**
 * @file Enforces authentication, scope, resource authorization, then dispatch.
 * @description
 * The Awtsmoos renews each boundary in its proper order. Awtsmoos.com never asks
 * the relay whether a tunnel exists until the verified account has proved owner
 * or grant authority for the exact resource and requested operation.
 */

/** Executes one account-bound filesystem action. */
async function protectedFs($i, variables = {}) {
	const identity = currentIdentity($i);
	if (!identity.ok) {
		return json($i, unauthorized(identity), 401);
	}
	let payload;
	try {
		payload = Policy.buildPayload($i, variables.tunnelName);
	} catch (error) {
		return json($i, failure(error.message), error.status || 400);
	}
	if (payload.payloadError) {
		return json($i, failure(payload.payloadError, payload.action), 400);
	}
	if (payload.action === "payloadEcho") {
		return json($i, { BH: "B\"H", ok: true, action: "payloadEcho", payload });
	}
	const permission = Policy.requiredPermission(payload.action);
	const policyDenial = coarsePolicyDenial(identity, payload.action, permission);
	if (policyDenial) {
		return json($i, policyDenial.body, policyDenial.status);
	}
	const rate = enforceApiKeyRate(identity, 0);
	if (!rate.ok) {
		return json($i, failure(rate.error), 429);
	}
	return executeAuthorized($i, identity, payload, permission);
}

/** Executes only after coarse and resource permissions are known. */
async function executeAuthorized($i, identity, payload, permission) {
	try {
		const vessel = resolveFsVessel({
			$i,
			identity,
			tunnelName: payload.tunnelName,
			payload,
			permission,
			timeoutMs: Policy.boundedTunnelTimeout(
				payload.timeoutMs || payload.timeout
			)
		});
		const result = await vessel.send();
		const response = normalizeResult(identity, payload, result);
		record(identity, payload, response, response.ok !== false);
		return json($i, response, response.status || 200);
	} catch (error) {
		record(identity, payload, null, false);
		return json($i, failure(error.message), error.status || 500);
	}
}

/** Applies stable response metadata and optional preview generation. */
function normalizeResult(identity, payload, result = {}) {
	const raw = {
		...result,
		requestAction: payload.action,
		actualAction: result.action || result.actualAction || ""
	};
	return Policy.wantsPreview(payload.autoPreview)
		? autoCreatePreviewResult(identity, payload, raw)
		: raw;
}

/** Enforces browser-session and OAuth/API-key scopes before resource lookup. */
function coarsePolicyDenial(identity, action, permission) {
	if (identity.kind === "session" && !Policy.sessionMayUse(action)) {
		return {
			status: 401,
			body: failure("api_key_or_oauth_required", action, permission)
		};
	}
	if (identity.kind !== "session" &&
		!scopeAllowed(identity, permission) &&
		!scopeAllowed(identity, "tunnel.admin")) {
		return {
			status: 403,
			body: failure("missing_scope", action, permission)
		};
	}
	return null;
}

/** Records bounded usage without credentials or response content. */
function record(identity, payload, response, ok) {
	recordUsage({
		userId: identity.userId,
		keyId: identity.clientId || null,
		action: payload.action,
		path: payload.path || payload.cwd || payload.url || null,
		bytes: response ? Policy.responseBytes(response) : 0,
		ok
	});
}

/** Preserves OpenAPI carrier normalization without granting authority. */
function normalizeCarriers(body = {}, $i = {}) {
	const post = { ...($i.paramKinds?.POST || {}), ...body };
	return Policy.buildPayload({
		...$i,
		paramKinds: { ...($i.paramKinds || {}), POST: post },
		$_POST: post
	});
}

function unauthorized(identity) {
	return failure(identity.error || "not_authenticated");
}

function failure(error, action = "", neededScope = "") {
	return { BH: "B\"H", ok: false, error, action, neededScope };
}

module.exports = {
	ONE_DAY_MS: Policy.ONE_DAY_MS,
	boundedTunnelTimeout: Policy.boundedTunnelTimeout,
	explicitTrue: Policy.wantsPreview,
	normalizeCarriers,
	protectedFs,
	withDefaultPreviewOff: (payload = {}) => ({
		...payload,
		autoPreview: payload.autoPreview === undefined ? false : payload.autoPreview
	})
};
