//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Same-origin client for owned canonical site mappings.
 * @description
 * The Awtsmoos lets browser intention approach an owned alias without carrying a credential in state;
 * Awtsmoos.com trusts only the existing same-origin session while every alias and site identity stays URL-bound and exact.
 */

export class SiteMappingClient {
	constructor({ fetchImpl = globalThis.fetch, apiBase = "/api/social/drive" } = {}) {
		this.fetchImpl = fetchImpl;
		this.apiBase = String(apiBase || "/api/social/drive").replace(/\/$/, "");
	}

	async listSites(aliasId) {
		const payload = await this.request(collectionUrl(this.apiBase, aliasId));
		if (!Array.isArray(payload?.sites)) throw invalidResponse();
		return payload.sites;
	}

	async upsertSite({ aliasId, siteId, rootPath, enabled = true, primary } = {}) {
		const body = { rootPath: String(rootPath ?? ""), enabled: Boolean(enabled) };
		if (primary !== undefined) body.primary = Boolean(primary);
		const payload = await this.request(itemUrl(this.apiBase, aliasId, siteId), {
			method: "PUT",
			body
		});
		if (!payload?.site || typeof payload.site !== "object") throw invalidResponse();
		return payload.site;
	}

	async deleteSite({ aliasId, siteId } = {}) {
		const payload = await this.request(itemUrl(this.apiBase, aliasId, siteId), {
			method: "DELETE"
		});
		if (!payload?.site || typeof payload.site !== "object") throw invalidResponse();
		return payload.site;
	}

	async request(url, options = {}) {
		if (typeof this.fetchImpl !== "function") throw new TypeError("A fetch implementation is required.");
		const headers = { accept: "application/json" };
		if (options.body) headers["content-type"] = "application/json";
		const response = await this.fetchImpl(url, {
			method: options.method || "GET",
			credentials: "same-origin",
			headers,
			body: options.body ? JSON.stringify(options.body) : undefined
		});
		const payload = await response.json().catch(() => null);
		if (!response.ok) throw responseError(response, payload);
		return payload;
	}
}

function collectionUrl(apiBase, aliasId) {
	return `${apiBase}/${encodeURIComponent(required(aliasId, "aliasId"))}/sites`;
}

function itemUrl(apiBase, aliasId, siteId) {
	return `${collectionUrl(apiBase, aliasId)}/${encodeURIComponent(required(siteId, "siteId"))}`;
}

function required(value, label) {
	const normalized = String(value || "").trim();
	if (!normalized) throw new TypeError(`${label} is required.`);
	return normalized;
}

function invalidResponse() {
	const error = new Error("The site mapping API returned an invalid response.");
	error.code = "SITE_MAPPING_INVALID_RESPONSE";
	return error;
}

function responseError(response, payload) {
	const serverError = payload?.error;
	const message = typeof serverError === "string"
		? serverError
		: serverError?.message || payload?.message || response.statusText || `Site mapping request failed with ${response.status}.`;
	const error = new Error(message);
	error.code = serverError?.code || payload?.code || "SITE_MAPPING_REQUEST_FAILED";
	error.status = response.status;
	error.serverError = serverError || null;
	error.neededScope = serverError?.neededScope || payload?.neededScope || null;
	return error;
}
