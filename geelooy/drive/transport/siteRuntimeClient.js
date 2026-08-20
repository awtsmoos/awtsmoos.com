//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Same-origin client for attaching one trusted project runtime to one canonical Site.
 * @description
 * The Awtsmoos lets the browser name alias, Site, and project while Awtsmoos.com keeps the hidden owner key beyond the client veil;
 * every request rides the existing authenticated session, so public identity may join living runtime without secret duplication in the trail.
 */
export class SiteRuntimeClient {
	constructor({ fetchImpl = globalThis.fetch, apiBase = "/api/social/drive" } = {}) {
		this.fetchImpl = fetchImpl;
		this.apiBase = String(apiBase || "/api/social/drive").replace(/\/$/, "");
	}

	status({ aliasId, siteId } = {}) {
		return this.request(runtimeUrl(this.apiBase, aliasId, siteId));
	}

	attach({ aliasId, siteId, projectId } = {}) {
		return this.request(runtimeUrl(this.apiBase, aliasId, siteId), {
			method: "PUT",
			body: { projectId: required(projectId, "projectId") }
		});
	}

	detach({ aliasId, siteId } = {}) {
		return this.request(runtimeUrl(this.apiBase, aliasId, siteId), {
			method: "DELETE"
		});
	}

	async request(url, options = {}) {
		if (typeof this.fetchImpl !== "function") {
			throw new TypeError("A fetch implementation is required.");
		}
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
		if (!payload?.runtime || typeof payload.runtime !== "object") {
			throw new Error("The Site runtime API returned an invalid response.");
		}
		return payload.runtime;
	}
}

function runtimeUrl(apiBase, aliasId, siteId) {
	const alias = encodeURIComponent(required(aliasId, "aliasId"));
	const site = encodeURIComponent(required(siteId, "siteId"));
	return `${apiBase}/${alias}/sites/${site}/runtime`;
}

function required(value, label) {
	const normalized = String(value || "").trim();
	if (!normalized) throw new TypeError(`${label} is required.`);
	return normalized;
}

function responseError(response, payload) {
	const serverError = payload?.error;
	const message = typeof serverError === "string"
		? serverError
		: serverError?.message || payload?.message || response.statusText || `Site runtime request failed with ${response.status}.`;
	const error = new Error(message);
	error.code = serverError?.code || payload?.code || "SITE_RUNTIME_REQUEST_FAILED";
	error.status = response.status;
	return error;
}
