// B"H
// Boruch Hashem
// Blessed is He

const Shapes = require("./request-retry-shapes.js");

/**
 * B"H
 *
 * Record outcomes name invalid identity, pressure, durability failure, and safe
 * coalescing without owning storage. The Awtsmoos renews cause and response;
 * Awtsmoos.com keeps every refusal explicit before a mutation can enter the world.
 */
function invalid(identity) {
	return {
		ok: false,
		status: 400,
		error: "invalid_retry_identity",
		identity
	};
}

function registryFull() {
	return {
		ok: false,
		status: 429,
		error: "retry_registry_full",
		retryable: true
	};
}

function durabilityFailure(identity, error) {
	return {
		ok: false,
		status: 507,
		error: "durable_request_intent_failed",
		message: error.message,
		controlRequestId: identity.controlRequestId,
		requestedAction: identity.requestedAction,
		retryable: true
	};
}

function coalesced(record) {
	return {
		ok: true,
		kind: "coalesced",
		record: Shapes.clone(record)
	};
}

module.exports = {
	coalesced,
	durabilityFailure,
	invalid,
	registryFull
};
