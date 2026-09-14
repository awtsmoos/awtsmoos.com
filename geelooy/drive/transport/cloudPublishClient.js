//B"H
//Boruch Hashem
//Blessed be He

import { SiteMappingClient } from "./siteMappingClient.js";

/**
 * @file Same-origin client for promoting Builder source into immutable Awtsmoos Cloud Sites.
 * @description The Awtsmoos keeps account cookies in the browser while Awtsmoos.com sends only bounded source, project identity, and deployment preconditions to owner-authorized Drive routes.
 */
export class CloudPublishClient {
	constructor({ fetchImpl = globalThis.fetch, apiBase = "/api/social/drive" } = {}) {
		this.fetchImpl = fetchImpl;
		this.apiBase = String(apiBase || "/api/social/drive").replace(/\/$/, "");
		this.siteClient = new SiteMappingClient({ fetchImpl, apiBase: this.apiBase });
	}

	/** Lists aliases owned by the current signed-in Awtsmoos account. */
	async aliases() {
		const payload = await this.request("/api/social/aliases");
		const value = Array.isArray(payload) ? payload : payload?.success;
		if (!Array.isArray(value)) throw cloudError("CLOUD_ALIAS_LIST_INVALID");
		return [...new Set(value.map(aliasIdOf).filter(Boolean))].sort();
	}

	/** Reads server-proven canonical Site mappings for one owned alias. */
	listSites(aliasId) {
		return this.siteClient.listSites(aliasId);
	}

	/** Publishes a bounded source manifest while keeping the Site disabled when requested. */
	bootstrap(input) {
		return this.request(`${this.aliasBase(input.aliasId)}/actions/bootstrap-site-project`, {
			method: "POST",
			body: {
				projectId: input.projectId,
				siteId: input.siteId,
				rootPath: input.rootPath,
				title: input.title,
				runtimePreference: "static",
				enabled: input.enabled,
				sourceVessel: input.sourceVessel,
				remixReceipt: input.remixReceipt,
				files: input.files
			}
		});
	}

	/** Creates one immutable production revision under an optimistic deployment precondition. */
	deploy(input) {
		const url = `${this.aliasBase(input.aliasId)}/sites/${encodeURIComponent(input.siteId)}/deployments`;
		return this.request(url, {
			method: "POST",
			body: {
				projectId: input.projectId,
				rootPath: input.rootPath,
				message: input.message,
				idempotencyKey: input.idempotencyKey,
				expectedDeploymentId: input.expectedDeploymentId
			}
		});
	}

	/** Enables a canonical Site after its first immutable revision exists. */
	enableSite(input) {
		return this.siteClient.upsertSite({
			aliasId: input.aliasId,
			siteId: input.siteId,
			rootPath: input.rootPath,
			enabled: true
		});
	}

	aliasBase(aliasId) {
		return `${this.apiBase}/${encodeURIComponent(required(aliasId, "aliasId"))}`;
	}

	async request(url, options = {}) {
		if (typeof this.fetchImpl !== "function") throw cloudError("CLOUD_FETCH_UNAVAILABLE");
		const response = await this.fetchImpl(url, requestOptions(options));
		const payload = await response.json().catch(() => null);
		if (!response.ok || payload?.error) throw responseError(response, payload);
		return payload;
	}
}

function requestOptions(options) {
	return {
		method: options.method || "GET",
		credentials: "same-origin",
		headers: options.body ? { accept: "application/json", "content-type": "application/json" } : { accept: "application/json" },
		body: options.body ? JSON.stringify(options.body) : undefined
	};
}

function aliasIdOf(value) {
	return String(typeof value === "string" ? value : value?.id || value?.aliasId || "").trim();
}

function required(value, label) {
	const text = String(value || "").trim();
	if (!text) throw new TypeError(`${label} is required.`);
	return text;
}

function responseError(response, payload) {
	const error = cloudError(payload?.error?.code || payload?.code || payload?.error || "CLOUD_PUBLISH_REQUEST_FAILED");
	error.status = response.status;
	error.server = payload;
	return error;
}

function cloudError(code) {
	const error = new Error(String(code));
	error.code = String(code);
	return error;
}
