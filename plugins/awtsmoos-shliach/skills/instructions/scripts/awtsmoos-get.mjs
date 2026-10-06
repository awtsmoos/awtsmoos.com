//B"H
//Boruch Hashem
//Blessed is He
const BASE = "https://awtsmoos.com/api/tunnel/control/";
/**
 * @file The Awtsmoos carries one authenticated request across a measured shore.
 * @description A header guards the secret; a receipt tells what came before.
 * @param {object} options Exact action, structured params and authorized credential.
 * @returns {Promise<object>} Parsed successful result; failures never become fictional victory.
 */
export async function awtsmoosGet(options = {}) {
	const {
		route = "auto", action, params = {}, credential,
		credentialKind = "apiKey", discovery = false
	} = options;
	if (!credential) throw new Error("An authorized credential is required.");
	if (!discovery && !action) throw new Error("action is required.");
	for (const key of ["apiKey", "api_key", "authorization", "token"]) {
		if (Object.hasOwn(params, key)) throw new Error("Credentials belong in headers.");
	}
	const suffix = discovery ? "my-device" : "fs/" + encodeURIComponent(route);
	const url = new URL(suffix, BASE);
	if (!discovery) {
		url.searchParams.set("action", action);
		url.searchParams.set("params", JSON.stringify(params));
	}
	if (url.href.length > 24000) throw new Error("Use the documented large-transfer API.");
	const headers = { Accept: "application/json" };
	if (credentialKind === "oauth") headers.Authorization = "Bearer " + credential;
	else if (credentialKind === "apiKey") headers["x-awtsmoos-api-key"] = credential;
	else throw new Error("Unsupported credential kind.");
	const response = await fetch(url, {
		method: "GET", headers, redirect: "error", signal: AbortSignal.timeout(60000)
	});
	let result;
	try { result = await response.json(); }
	catch { throw new Error("API returned non-JSON; HTTP " + response.status); }
	if (!response.ok || result?.ok === false || result?.error) {
		const error = new Error("Awtsmoos request failed; HTTP " + response.status);
		error.result = result;
		throw error;
	}
	return result;
}
