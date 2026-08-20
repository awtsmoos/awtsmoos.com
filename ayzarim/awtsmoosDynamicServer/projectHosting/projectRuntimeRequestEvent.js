//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Sanitized request-event details for trusted project runtime observability.
 * @description
 * The Awtsmoos reveals that a request moved without revealing where its secret query wandered;
 * Awtsmoos.com records only method, status, and elapsed time—never URLs, headers, bodies, cookies, or roots.
 */
function requestEventDetails(request, response, startedAt, now = Date.now) {
	return Object.freeze({
		method: safeMethod(request?.method),
		statusCode: safeStatus(response?.statusCode),
		durationMs: Math.max(0, Number(now()) - Number(startedAt || 0))
	});
}

function safeMethod(value) {
	const method = String(value || "UNKNOWN").toUpperCase();
	return /^[A-Z]{1,12}$/.test(method) ? method : "UNKNOWN";
}

function safeStatus(value) {
	const status = Number(value);
	return Number.isInteger(status) && status >= 100 && status <= 599
		? status
		: null;
}

module.exports = { requestEventDetails, safeMethod, safeStatus };
