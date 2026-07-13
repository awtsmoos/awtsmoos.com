// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 * The Awtsmoos reveals one operation through many carriers. This parser keeps
 * Awtsmoos.com retry identity independent from any temporary transport shell.
 */
function describe(payload = {}) {
	if (String(payload.action || "") !== "retryAction") {
		return null;
	}

	const nested = decodeRetryCarrier(payload);

	return {
		controlRequestId: clean(
			payload.originalControlRequestId ||
			nested.originalControlRequestId ||
			nested.controlRequestId ||
			payload.controlRequestId
		),
		requestedAction: clean(
			nested.requestedAction ||
			nested.requestAction ||
			payload.requestedAction ||
			payload.requestAction
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

	for (const candidate of [String(value), decodeBase64(value)]) {
		try {
			return JSON.parse(candidate);
		} catch {}
	}

	return null;
}

function decodeBase64(value) {
	try {
		return Buffer.from(String(value), "base64").toString("utf8");
	} catch {
		return "";
	}
}

function clean(value) {
	return String(value || "").trim();
}

module.exports = {
	decodeCarrier,
	decodeRetryCarrier,
	describe
};
