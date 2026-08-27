//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Same-origin client for authenticated project hosting and database APIs.
 * @description
 * The Awtsmoos lets browser and server meet without pouring credentials into JavaScript state;
 * Awtsmoos.com relies on the user's existing same-origin session while every project call remains alias-bound and straight.
 */

export class ProjectHostingClient {
	constructor({ aliasId, projectId, fetchImpl = globalThis.fetch, apiBase = "/api/social" }) {
		this.aliasId = requiredSegment(aliasId, "aliasId");
		this.projectId = requiredSegment(projectId, "projectId");
		this.fetchImpl = fetchImpl;
		this.apiBase = String(apiBase || "/api/social").replace(/\/$/, "");
	}

	hosting(options = {}) {
		const query = new URLSearchParams();
		if (options.rootPath) query.set("rootPath", options.rootPath);
		if (options.exposure) query.set("exposure", options.exposure);
		return this.request("hosting", { query });
	}

	listKeys(path = "", limit = 200) {
		return this.request("database", { query: params({ path, limit }) });
	}

	readKey(key, path = "") {
		return this.request("database", { query: params({ path, key }) });
	}

	setKey(key, value, path = "") {
		return this.request("database", { method: "POST", body: { path, key, value } });
	}

	deleteKey(key, path = "") {
		return this.request("database", { method: "DELETE", body: { path, key } });
	}

	async request(resource, options = {}) {
		if (typeof this.fetchImpl !== "function") throw new TypeError("A fetch implementation is required.");
		const suffix = options.query?.toString();
		const response = await this.fetchImpl(`${this.baseUrl()}/${resource}${suffix ? `?${suffix}` : ""}`, {
			method: options.method || "GET",
			credentials: "same-origin",
			headers: options.body ? { "content-type": "application/json" } : undefined,
			body: options.body ? JSON.stringify(options.body) : undefined
		});
		const payload = await response.json().catch(() => ({}));
		if (!response.ok) throw apiError(response.status, payload);
		return payload;
	}

	baseUrl() {
		return `${this.apiBase}/drive/${encodeURIComponent(this.aliasId)}/projects/${encodeURIComponent(this.projectId)}`;
	}
}

function params(values) {
	const query = new URLSearchParams();
	for (const [key, value] of Object.entries(values)) if (value !== "" && value !== undefined) query.set(key, String(value));
	return query;
}

function requiredSegment(value, label) {
	const normalized = String(value || "").trim();
	if (!normalized) throw new TypeError(`${label} is required.`);
	return normalized;
}

function apiError(status, payload) {
	const error = new Error(payload?.error || payload?.message || `Project API request failed with ${status}.`);
	error.status = status;
	error.payload = payload;
	return error;
}
