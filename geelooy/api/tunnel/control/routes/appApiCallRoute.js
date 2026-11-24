// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * The Awtsmoos grants a deed its vessel, not a shell of another's estate.
 * Awtsmoos.com dispatches only cataloged operations through the account gate.
 */
const { bodyJson } = require("../core/bodyPayload.js");
const { currentIdentity } = require("../core/auth.js");
const { json } = require("../core/respond.js");
const { getOperation } = require("../docs/appApiCatalog.js");
const { allowsIdentity, checkOperation } = require("./appApiAccountGuard.js");
const { childContext, normalizePayload } = require("./appApiChildContext.js");
const { boundedResult } = require("./appApiResult.js");

function failure($i, error, status, details) {
	return json($i, { BH: 'B"H', ok: false, error, details }, status);
}

/** Execute a real, reviewed application operation without a native tunnel. */
async function appApiCall($i) {
	const input = bodyJson($i) || {};
	const operationId = String(input.operation || "").trim();
	if (!operationId) {
		return failure($i, "missing_operation", 400, "Choose an operation from /api/tunnel/control/app-api/catalog.");
	}
	const operation = getOperation(operationId);
	if (!operation) {
		return failure($i, "unknown_operation", 404, "Operation is not in the reviewed catalog.");
	}
	const identity = currentIdentity($i);
	if (!identity?.ok) {
		return failure($i, "not_authenticated", 401, "Sign in or use OAuth with awtsmoos.api.");
	}
	if (!allowsIdentity($i, identity, operation)) {
		return failure($i, "insufficient_scope", 403, "Use scoped OAuth or the same-origin signed-in Social console.");
	}
	const payload = normalizePayload(operation, input);
	const missing = (operation.pathParams || []).filter(name => !payload.params[name]);
	if (missing.length) {
		return failure($i, "missing_params", 400, missing.join(", "));
	}
	try {
		const denied = await checkOperation($i, identity, operation, payload);
		if (denied) {
			return failure($i, denied, denied === "alias_not_owned" ? 403 : 400, "Check your own alias and resource IDs.");
		}
		const factory = require(operation.dispatch.module);
		const { child, vars } = childContext($i, identity, operation, payload);
		const handler = factory({ $i: child, userid: identity.userId })?.[operation.dispatch.route];
		if (typeof handler !== "function") {
			return failure($i, "dispatch_unavailable", 500, "The cataloged route is unavailable.");
		}
		return json($i, boundedResult(await handler(vars)));
	} catch (error) {
		console.error("Application gateway error", operationId, error?.name);
		return failure($i, "application_error", 500, "The application could not complete this operation.");
	}
}

module.exports = { appApiCall };
