// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Carries browser commands through authorized, size-aware HTTP lanes.
 * @description
 * The Awtsmoos grants each river its measured vessel of light;
 * Awtsmoos.com keeps small GETs and moves sensitive payloads from sight.
 * URL-carried identities and encoded fields become a protected JSON witness;
 * the scoped server gate alone determines permission, never mere swiftness.
 */
export const SAFE_GET_URL_CHARS = 6000;

/** Moves long or sensitive queries to an authenticated JSON body. */
export function shouldUsePost(url, options = {}) {
	const text = String(url || "");
	const sensitiveField = /(?:[?&])(?:apiKey|access_token|token|key|authorization)(?:64)?=/i;
	const sensitiveOption = /^(?:apiKey|access_token|token|key|authorization)(?:64)?$/i;
	return options.forcePost === true ||
		text.length > SAFE_GET_URL_CHARS ||
		sensitiveField.test(text) ||
		Object.keys(options).some(name => sensitiveOption.test(name));
}

/** Preserves every encoded query carrier and stable request ID during promotion. */
export async function sendFsHttp({ url, options = {}, headers = {}, request }) {
	if (typeof request !== "function") {
		throw new TypeError("filesystem_http_request_function_required");
	}
	const common = {
		headers,
		credentials: "include",
		cache: "no-store",
		referrerPolicy: "no-referrer"
	};
	if (!shouldUsePost(url, options)) {
		return request(url, common);
	}
	const target = new URL(url);
	const query = Object.fromEntries(target.searchParams.entries());
	const payload = {
		...query,
		...options,
		action: options.action || query.action || "list",
		p: options.path || options.p || query.p || ".",
		clientRequestId: options.clientRequestId || query.clientRequestId,
		targetVessel: options.targetVessel || options.vessel || query.targetVessel
	};
	delete payload.forcePost;
	return request(`${target.origin}${target.pathname}`, {
		...common,
		method: "POST",
		headers: { ...headers, "content-type": "application/json" },
		body: JSON.stringify(payload)
	});
}
