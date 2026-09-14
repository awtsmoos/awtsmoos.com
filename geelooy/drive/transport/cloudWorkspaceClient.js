//B"H
//Boruch Hashem
//Blessed be He

import { clientError, payloadFailure, responseFailure } from "./cloudWorkspaceErrors.js";

/**
 * @file Same-origin client for owner-scoped Awtsmoos Cloud Drive CRUD.
 * @description The Awtsmoos keeps cloud drafts private while Awtsmoos.com reuses
 * existing authenticated Drive routes for bounded listing, text reads, writes, and folders.
 */
export class CloudWorkspaceClient {
	constructor({ fetchImpl = globalThis.fetch, apiBase = "/api/social/drive" } = {}) {
		this.fetchImpl = fetchImpl;
		this.apiBase = String(apiBase || "/api/social/drive").replace(/\/$/, "");
	}

	/** Lists aliases already owned by the current signed-in session. */
	async aliases() {
		const payload = await this.json("/api/social/aliases");
		const values = Array.isArray(payload) ? payload : payload?.success;
		if (!Array.isArray(values)) throw clientError("CLOUD_ALIAS_LIST_INVALID");
		return [...new Set(values.map(aliasIdOf).filter(Boolean))].sort();
	}

	/** Lists one bounded folder of private or public entries. */
	async list(aliasId, path = ".") {
		const url = new URL(`${this.aliasBase(aliasId)}/entries`, locationOrigin());
		if (path && path !== ".") url.searchParams.set("path", path);
		url.searchParams.set("limit", "250");
		const payload = await this.json(url.pathname + url.search);
		if (!Array.isArray(payload?.entries)) throw clientError("CLOUD_ENTRY_LIST_INVALID");
		return payload.entries;
	}

	/** Reads one private text file through the owner-authorized content response. */
	async read(aliasId, path) {
		const url = `${this.entryUrl(aliasId, path)}?content=true`;
		const response = await this.fetch(url, { method: "GET" });
		if (!response.ok) throw await responseFailure(response);
		const contentType = response.headers?.get?.("content-type") || "";
		if (contentType.includes("application/json")) {
			const payload = await response.json().catch(() => null);
			if (payload?.ok === false || payload?.error) throw payloadFailure(payload, response.status);
			return typeof payload === "string" ? payload : JSON.stringify(payload);
		}
		return await response.text();
	}

	/** Writes one text file privately unless a later publication explicitly promotes it. */
	write(aliasId, path, content) {
		return this.json(this.entryUrl(aliasId, path), {
			method: "PUT",
			body: { text: String(content ?? ""), visibility: "private" }
		});
	}

	/** Creates one private folder under the owned alias Drive. */
	mkdir(aliasId, path) {
		return this.json(`${this.aliasBase(aliasId)}/entries`, {
			method: "POST",
			body: { type: "folder", path: String(path || ""), visibility: "private" }
		});
	}

	aliasBase(aliasId) {
		return `${this.apiBase}/${encodeURIComponent(required(aliasId, "aliasId"))}`;
	}

	entryUrl(aliasId, path) {
		const encoded = String(path || "").split("/").map(encodeURIComponent).join("/");
		return `${this.aliasBase(aliasId)}/entry/${encoded}`;
	}

	async json(url, options = {}) {
		const response = await this.fetch(url, options);
		const payload = await response.json().catch(() => null);
		if (!response.ok || payload?.ok === false || payload?.error) {
			throw payloadFailure(payload, response.status);
		}
		return payload;
	}

	fetch(url, options = {}) {
		if (typeof this.fetchImpl !== "function") throw clientError("CLOUD_FETCH_UNAVAILABLE");
		const headers = { accept: "application/json" };
		if (options.body) headers["content-type"] = "application/json";
		return this.fetchImpl(url, {
			method: options.method || "GET",
			credentials: "same-origin",
			headers,
			body: options.body ? JSON.stringify(options.body) : undefined
		});
	}
}

function aliasIdOf(value) {
	return String(typeof value === "string" ? value : value?.id || value?.aliasId || "").trim();
}

function required(value, label) {
	const text = String(value || "").trim();
	if (!text) throw new TypeError(`${label} is required.`);
	return text;
}

function locationOrigin() {
	return globalThis.location?.origin || "http://awtsmoos.local";
}
