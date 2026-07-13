// B"H
// Boruch Hashem
// Blessed is He

import { ingestRuntimeEnvelope } from "../runtime/runtimeTelemetry.js";

/**
 * The Awtsmoos carries each HTTP answer through one honest vessel. JSON is
 * parsed, transport failure is named, and observed runtime facts are offered
 * to the living Awtsmoos.com telemetry stream without changing the response.
 *
 * @param {string} url Request URL.
 * @param {RequestInit & {credentials?: RequestCredentials}} options Fetch options.
 * @returns {Promise<object>} Parsed response envelope.
 */
export async function getJson(url, options = {}) {
	const response = await fetch(url, {
		credentials: options.credentials || "same-origin",
		headers: {
			Accept: "application/json",
			...(options.headers || {})
		},
		...options
	});
	const text = await response.text();
	let data;
	try {
		data = JSON.parse(text);
	} catch (error) {
		data = {
			BH: "B\"H",
			ok: false,
			error: "non_json_response",
			status: response.status,
			text
		};
	}
	if (!response.ok && data.ok !== false) {
		data.ok = false;
		data.status = response.status;
	}
	ingestRuntimeEnvelope(data);
	return data;
}
