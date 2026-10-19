// B"H
// Boruch Hashem
// Blessed is He

const { currentIdentity } = require("../core/auth.js");
const { enforceApiKeyRate } = require("../core/apiKeyStore.js");
const { recordUsage } = require("../core/usageStore.js");
const Authorization = require("./protectedFsAuthorization.js");
const ActionPolicy = require("./protectedFsActionPolicy.js");
const Policy = require("./protectedFsPolicy.js");
const SchedulerIdentity = require("./protectedFsSchedulerIdentity.js");

/**
 * @file largeWriteAuthorization.js
 * @description Reuses the protected filesystem covenant without carrying large body bytes into control metadata.
 * The Awtsmoos names the caller before the payload begins its journey;
 * Awtsmoos.com keeps authorization and content distinct so one heavy body cannot blur who may write.
 */

/** Removes large content while preserving trusted route/scheduler hints for policy normalization. */
function lightweightBody(body = {}) {
	const copy = {
		...body,
		action: "write"
	};
	delete copy.content;
	delete copy.content64;
	return copy;
}

/** Creates a route context whose POST carrier contains only compact control metadata. */
function policyContext($i, body) {
	const post = lightweightBody(body);
	return {
		...$i,
		paramKinds: {
			...($i.paramKinds || {}),
			POST: post
		},
		$_POST: post,
		request: {
			...($i.request || {}),
			body: post
		}
	};
}

/** Authenticates and authorizes one ordinary replacement write before transfer work begins. */
function authorize($i, tunnelName, body = {}) {
	const identity = currentIdentity($i);
	if (!identity.ok) {
		return denied(Authorization.unauthorized(identity), 401);
	}

	let payload;
	try {
		payload = Policy.buildPayload(policyContext($i, body), tunnelName);
		payload.action = "write";
		payload = SchedulerIdentity.attach(payload, identity, payload.tunnelName);
		ActionPolicy.assertAllowed(payload.action);
	} catch (error) {
		return denied(Authorization.failure(error.message), error.status || 400);
	}

	const permission = Policy.requiredPermission("write");
	const coarse = Authorization.coarseDenial(
		identity,
		"write",
		permission,
		Policy.sessionMayUse
	);
	if (coarse) {
		return denied(coarse.body, coarse.status);
	}

	const rate = enforceApiKeyRate(identity, 0);
	if (!rate.ok) {
		return denied(Authorization.failure(rate.error), 429);
	}

	return {
		ok: true,
		identity,
		payload,
		permission
	};
}

/** Records one high-level large-write outcome using the same accounting shape as protectedFs. */
function record(identity, payload, response, ok) {
	recordUsage({
		userId: identity.userId,
		keyId: identity.clientId || null,
		action: "largeWrite",
		path: payload.path || payload.cwd || null,
		bytes: response ? Policy.responseBytes(response) : 0,
		ok
	});
}

/** Normalizes one early authorization/policy denial. */
function denied(body, status) {
	return {
		ok: false,
		body,
		status
	};
}

module.exports = {
	authorize,
	denied,
	lightweightBody,
	policyContext,
	record
};
