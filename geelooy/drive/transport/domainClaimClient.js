//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Same-origin client for owned custom-domain claims.
 * @description
 * The Awtsmoos lets the browser ask for proof without carrying authority in local state;
 * Awtsmoos.com binds every request to encoded alias, site, and hostname identities.
 */

export class DomainClaimClient {
	constructor({ fetchImpl = globalThis.fetch, apiBase = "/api/social/drive" } = {}) {
		this.fetchImpl = fetchImpl;
		this.apiBase = String(apiBase || "/api/social/drive").replace(/\/$/, "");
	}

	async listClaims({ aliasId, siteId } = {}) {
		const payload = await this.request(collectionUrl(this.apiBase, aliasId, siteId));
		if (!Array.isArray(payload?.domains)) throw invalidResponse();
		return payload.domains;
	}

	async createClaim({ aliasId, siteId, hostname, dnsMode, nameservers } = {}) {
		const payload = await this.request(collectionUrl(this.apiBase, aliasId, siteId), {
			method: "POST",
			body: { hostname, dnsMode, nameservers }
		});
		return domainFrom(payload);
	}

	async getClaim({ aliasId, siteId, hostname } = {}) {
		return domainFrom(await this.request(itemUrl(this.apiBase, aliasId, siteId, hostname)));
	}

	async verifyOwnership({ aliasId, siteId, hostname } = {}) {
		return domainFrom(await this.request(
			`${itemUrl(this.apiBase, aliasId, siteId, hostname)}/verify`,
			{ method: "POST" }
		));
	}

	async verifyDelegation({ aliasId, siteId, hostname } = {}) {
		return domainFrom(await this.request(
			`${itemUrl(this.apiBase, aliasId, siteId, hostname)}/verify-delegation`,
			{ method: "POST" }
		));
	}

	async deleteClaim({ aliasId, siteId, hostname } = {}) {
		return domainFrom(await this.request(itemUrl(this.apiBase, aliasId, siteId, hostname), {
			method: "DELETE"
		}));
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

function collectionUrl(apiBase, aliasId, siteId) {
	const alias = encodeURIComponent(required(aliasId, "aliasId"));
	const site = encodeURIComponent(required(siteId, "siteId"));
	return `${apiBase}/${alias}/sites/${site}/domains`;
}

function itemUrl(apiBase, aliasId, siteId, hostname) {
	return `${collectionUrl(apiBase, aliasId, siteId)}/${encodeURIComponent(required(hostname, "hostname"))}`;
}

function domainFrom(payload) {
	if (!payload?.domain || typeof payload.domain !== "object") throw invalidResponse();
	return payload.domain;
}

function required(value, label) {
	const normalized = String(value || "").trim();
	if (!normalized) throw new TypeError(`${label} is required.`);
	return normalized;
}

function invalidResponse() {
	const error = new Error("The domain claim API returned an invalid response.");
	error.code = "DOMAIN_CLAIM_INVALID_RESPONSE";
	return error;
}

function responseError(response, payload) {
	const serverError = payload?.error;
	const message = typeof serverError === "string"
		? serverError
		: serverError?.message || payload?.message || response.statusText || `Domain request failed with ${response.status}.`;
	const error = new Error(message);
	error.code = serverError?.code || payload?.code || "DOMAIN_CLAIM_REQUEST_FAILED";
	error.status = response.status;
	error.serverError = serverError || null;
	error.neededScope = serverError?.neededScope || payload?.neededScope || null;
	return error;
}
