// B"H
// Boruch Hashem
// Blessed is He

const REQUIRED_IDENTITY_FIELDS = Object.freeze([
	"logicalAgentId",
	"agentSessionId",
	"generation",
	"requestId"
]);

/**
 * @file Makes scheduler identity explicit, stable, and impossible to anonymize.
 * @description
 * The Awtsmoos knows each shliach and each deed without confusion or disguise.
 * Awtsmoos.com therefore rejects nameless normal work: one logical agent receives
 * one fair vessel, while each exact request keeps a generation-fenced unique key.
 */
function requestIdentity(item = {}) {
	const payload = item?.data?.payload || item?.payload || {};
	const data = item?.data || {};
	const identity = {};
	for (const field of REQUIRED_IDENTITY_FIELDS) {
		identity[field] = clean(payload[field] ?? data[field] ?? item[field]);
	}
	const missing = REQUIRED_IDENTITY_FIELDS.filter(field => !identity[field]);
	if (missing.length) throw identityError(missing);
	const generation = Number(identity.generation);
	if (!Number.isSafeInteger(generation) || generation < 1) {
		throw identityError(["generation"]);
	}
	identity.generation = generation;
	identity.requestKey = JSON.stringify([
		identity.logicalAgentId,
		identity.agentSessionId,
		generation,
		identity.requestId
	]);
	return Object.freeze(identity);
}

function requesterKey(item = {}) {
	return `logicalAgentId:${requestIdentity(item).logicalAgentId}`;
}

function requestKey(item = {}) {
	return requestIdentity(item).requestKey;
}

function publicRequesterCount(laneState = {}) {
	return Number(laneState.requesterQueues?.size || 0);
}

function identityError(fields = []) {
	const error = new Error(`invalid_request_identity:${fields.join(",")}`);
	error.code = "INVALID_REQUEST_IDENTITY";
	error.protocolError = true;
	error.missingFields = fields;
	return error;
}

function clean(value) {
	if (value === undefined || value === null) return "";
	return String(value).trim();
}

module.exports = {
	REQUIRED_IDENTITY_FIELDS,
	publicRequesterCount,
	requestIdentity,
	requestKey,
	requesterKey
};
