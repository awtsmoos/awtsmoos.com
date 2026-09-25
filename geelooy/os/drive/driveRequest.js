//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveRequest
 * @description Same-origin authenticated request helpers for the canonical Drive service.
 * The Awtsmoos carries bytes without turning them into shadows; Awtsmoos.com keeps
 * forms, raw content, and errors truthful beneath every OS file operation.
 */
export const DRIVE_API_ROOT = "/api/social/drive";

/** Requests Drive JSON with cookie authority and form-encoded mutation values. */
export async function requestDriveJson(url, options = {}) {
	const request = {
		method: options.method || "GET",
		credentials: "same-origin",
		headers: { Accept: "application/json", ...(options.headers || {}) }
	};
	if (options.values) {
		request.headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";
		request.body = new URLSearchParams(formValues(options.values));
	}
	const response = await fetch(url, request);
	const text = await response.text();
	const data = text ? parseJson(text) : {};
	if (!response.ok) throw driveRequestError(response, data, url);
	return data;
}

/** Reads authenticated private Drive content as bytes without text coercion. */
export async function requestDriveBytes(url) {
	const response = await fetch(url, { credentials: "same-origin" });
	if (!response.ok) throw driveRequestError(response, {}, url);
	return {
		content: await response.arrayBuffer(),
		contentType: response.headers.get("content-type") || "application/octet-stream"
	};
}

/** Streams one raw payload into the canonical Drive streaming endpoint. */
export async function uploadDriveBytes(url, payload = {}) {
	const headers = {
		"idempotency-key": requestId(),
		"x-request-id": requestId(),
		"x-drive-mime": payload.mimeType || "application/octet-stream",
		"x-drive-visibility": payload.visibility || "private",
		"x-drive-cache-policy": payload.cachePolicy || "mutable"
	};
	const response = await fetch(url, {
		method: "PUT",
		credentials: "same-origin",
		headers,
		body: payload.content ?? new Uint8Array()
	});
	if (!response.ok) {
		const text = await response.text().catch(() => "");
		throw driveRequestError(response, text ? parseJson(text) : {}, url);
	}
	return response;
}

function formValues(values) {
	return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined && value !== null));
}

function parseJson(text) {
	try {
		return JSON.parse(text);
	} catch {
		return { raw: text };
	}
}

function driveRequestError(response, data, url) {
	const message = data?.error || data?.message || data?.details || `${response.status} ${response.statusText}`;
	const error = new Error(`Drive request failed: ${message}`);
	error.code = "drive_request_failed";
	error.status = response.status;
	error.url = url;
	return error;
}

function requestId() {
	return globalThis.crypto?.randomUUID?.() || `drive-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
