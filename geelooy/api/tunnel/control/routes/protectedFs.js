// B"H
// Boruch Hashem
// Blessed is He

const { currentIdentity } = require("../core/auth.js");
const { enforceApiKeyRate } = require("../core/apiKeyStore.js");
const { recordUsage } = require("../core/usageStore.js");
const { json } = require("../core/respond.js");
const { autoCreatePreviewResult } = require("../preview/previewAutoCreate.js");
const { resolveFsVessel } = require("./fsVessel/resolveFsVessel.js");
const Authorization = require("./protectedFsAuthorization.js");
const Policy = require("./protectedFsPolicy.js");

/**
 * @file Authenticates, authorizes, resolves one account vessel, and dispatches.
 * @description
 * The Awtsmoos renews identity and authority without confusing login with mutation.
 * Awtsmoos.com permits safe signed-session reads, names missing API-key authority
 * truthfully, then resolves the exact account-scoped tunnel only after policy passes.
 */
async function protectedFs($i, variables = {}) {
	const identity = currentIdentity($i);
	if (!identity.ok) {
		return json($i, Authorization.unauthorized(identity), 401);
	}
	let payload;
	try {
		payload = Policy.buildPayload($i, variables.tunnelName);
	} catch (error) {
		return json($i, Authorization.failure(error.message), error.status || 400);
	}
	if (payload.payloadError) {
		return json($i, Authorization.failure(payload.payloadError, {
			action: payload.action
		}), 400);
	}
	if (payload.action === "payloadEcho") {
		return json($i, { BH: "B\"H", ok: true, action: "payloadEcho", payload });
	}
	const permission = Policy.requiredPermission(payload.action);
	const denial = Authorization.coarseDenial(
		identity,
		payload.action,
		permission,
		Policy.sessionMayUse
	);
	if (denial) return json($i, denial.body, denial.status);
	const rate = enforceApiKeyRate(identity, 0);
	if (!rate.ok) {
		return json($i, Authorization.failure(rate.error), 429);
	}
	return executeAuthorized($i, identity, payload, permission);
}

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
		return json($i, Authorization.failure(error.message), error.status || 500);
	}
}

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

function normalizeCarriers(body = {}, $i = {}) {
	const post = { ...($i.paramKinds?.POST || {}), ...body };
	return Policy.buildPayload({
		...$i,
		paramKinds: { ...($i.paramKinds || {}), POST: post },
		$_POST: post
	});
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
