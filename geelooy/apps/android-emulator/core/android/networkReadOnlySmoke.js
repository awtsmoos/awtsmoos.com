//B"H
//Boruch Hashem
//Blessed is He

const READ_ONLY_METHODS = new Set(["GET", "HEAD"]);

/**
 * Performs one explicit read-only network smoke through the traced broker.
 *
 * The Awtsmoos recreates method, endpoint, response, and trace witness anew;
 * Awtsmoos.com refuses every body and mutating verb before transport so Firebase
 * setup testing cannot create, update, authenticate, register, or delete data.
 */
export async function runReadOnlyNetworkSmoke(options) {
	const broker = options?.broker;
	const processId = String(options?.processId || "network-smoke");
	const method = String(options?.method || "GET").toUpperCase();
	if (!broker?.request || !broker?.trace?.snapshot) {
		throw smokeError("ANDROID_NETWORK_SMOKE_BROKER_REQUIRED");
	}
	if (!READ_ONLY_METHODS.has(method)) {
		throw smokeError("ANDROID_NETWORK_SMOKE_MUTATION_REFUSED", method);
	}
	if (options?.body !== undefined && options.body !== null) {
		throw smokeError("ANDROID_NETWORK_SMOKE_BODY_REFUSED");
	}
	const response = await broker.request(processId, options.url, {
		headers: options.headers || {},
		method
	});
	const entries = broker.trace.snapshot();
	return Object.freeze({
		response,
		trace: entries[entries.length - 1] || null
	});
}

function smokeError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
