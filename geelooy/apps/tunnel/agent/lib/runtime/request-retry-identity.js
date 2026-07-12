// B"H
const Correlation = require('./correlation.js');

/** B"H — Original retry identity is recovered from bounded nested carriers. */
function requestIdentity(payload = {}, data = {}) {
	const scope = Correlation.extract({ ...data, payload });
	return {
		controlRequestId: clean(scope.controlRequestId || data.id),
		requestedAction: clean(
			payload.requestedAction || payload.requestAction || payload.action
		)
	};
}

function retryIdentity(payload = {}, data = {}) {
	const nested = decodeParams(payload);
	return {
		controlRequestId: clean(
			payload.originalControlRequestId ||
			nested.controlRequestId ||
			payload.controlRequestId ||
			data.originalControlRequestId
		),
		requestedAction: clean(
			nested.requestedAction ||
			payload.requestedAction ||
			payload.requestAction ||
			data.requestedAction
		)
	};
}

function decodeParams(payload = {}) {
	return Correlation.decodeCarrier(payload.params, 'params') ||
		Correlation.decodeCarrier(payload.params64, 'params64') || {};
}

function clean(value) {
	return String(value || '').trim();
}

module.exports = { clean, decodeParams, requestIdentity, retryIdentity };
