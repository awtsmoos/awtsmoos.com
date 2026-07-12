// B"H
const crypto = require('node:crypto');
const Extract = require('./correlation-extract.js');

/**
 * B"H — Fallback request IDs are created, but absent optional fields remain
 * absent so they can never erase valid result-side worker or job identities.
 */
function correlationFields(input = {}) {
	const scope = Extract.extractCorrelationScope(input);
	return clean({
		...scope,
		controlRequestId: scope.controlRequestId || nextId('ctrl'),
		clientRequestId: scope.clientRequestId || nextId('client'),
		nonce: scope.nonce || nextId('nonce')
	});
}

function mergeCorrelationScope(payload = {}) {
	if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return payload;
	return { ...payload, ...Extract.extractCorrelationScope(payload) };
}

function correlationEnvelope(input = {}) {
	return correlationFields(input);
}

function clean(input = {}) {
	const output = {};
	for (const [key, value] of Object.entries(input)) {
		if (value !== undefined && value !== null && value !== '') output[key] = value;
	}
	return output;
}

function nextId(prefix) {
	return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
}

module.exports = {
	clean,
	correlationEnvelope,
	correlationFields,
	mergeCorrelationScope,
	nextId
};
