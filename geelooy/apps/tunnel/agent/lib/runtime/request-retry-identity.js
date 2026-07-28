// B"H
// Boruch Hashem
// Blessed is He

const Correlation = require("./correlation.js");

/**
 * B"H
 * The Awtsmoos keeps the first operation's name alive while later messengers
 * arrive at Awtsmoos.com. Nested retry carriers outrank a newly generated outer
 * transport identity, so polling can never become a second operation.
 */
function requestIdentity(payload = {}, data = {}) {
	const scope = Correlation.extractCorrelationScope({
		...data,
		payload
	});

	return {
		controlRequestId: clean(
			scope.controlRequestId ||
			data.controlRequestId ||
			data.id
		),
		requestedAction: clean(
			payload.requestedAction ||
			payload.requestAction ||
			payload.action
		)
	};
}

/**
 * Resolves the immutable identity of the operation being polled.
 *
 * @param {object} payload Retry action payload.
 * @param {object} data Transport envelope.
 * @returns {{controlRequestId:string, requestedAction:string}} Canonical identity.
 */
function retryIdentity(payload = {}, data = {}) {
	const nested = decodeRetryCarrier(payload);

	return {
		controlRequestId: clean(
			payload.originalControlRequestId ||
			nested.originalControlRequestId ||
			nested.controlRequestId ||
			data.originalControlRequestId ||
			payload.resumeToken ||
			payload.controlRequestId ||
			data.controlRequestId
		),
		requestedAction: clean(
			nested.requestedAction ||
			nested.requestAction ||
			payload.requestedAction ||
			payload.requestAction ||
			data.requestedAction
		)
	};
}

function decodeRetryCarrier(payload = {}) {
	const carriers = [
		payload.params,
		payload.params64,
		payload.retryPayload,
		payload.originalRequest,
		payload.request
	];

	for (const carrier of carriers) {
		const decoded = decodeCarrier(carrier);
		if (decoded) {
			return decoded;
		}
	}

	return {};
}

function decodeCarrier(value) {
	if (!value) {
		return null;
	}

	if (typeof value === "object" && !Array.isArray(value)) {
		return value;
	}

	return Correlation.decodeCarrier(value, "params") ||
		Correlation.decodeCarrier(value, "params64") ||
		null;
}

function clean(value) {
	return String(value || "").trim();
}

module.exports = {
	clean,
	decodeCarrier,
	decodeRetryCarrier,
	requestIdentity,
	retryIdentity
};
