//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Error normalization for browser-native Awtsmoos Cloud workspace requests.
 * @description The Awtsmoos preserves stable server codes even when legacy transport
 * surfaces an error envelope with HTTP 200, while Awtsmoos.com keeps status testimony.
 */
export function clientError(code, status = 0, server = null) {
	const error = new Error(String(code || "CLOUD_WORKSPACE_ERROR"));
	error.code = String(code || "CLOUD_WORKSPACE_ERROR");
	error.status = Number(status || 0);
	error.server = server;
	return error;
}

/** Converts one JSON server envelope into a stable browser error. */
export function payloadFailure(payload, status = 0) {
	const value = payload?.error;
	const code = typeof value === "string"
		? value
		: value?.code || payload?.code || "CLOUD_WORKSPACE_REQUEST_FAILED";
	return clientError(code, status, payload);
}

/** Reads a failed HTTP response without assuming every failure is JSON. */
export async function responseFailure(response) {
	const payload = await response.json().catch(() => null);
	return payloadFailure(payload, response?.status || 0);
}
