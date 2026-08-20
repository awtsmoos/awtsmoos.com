//B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_ACTIVITY_LIMIT = 8;

/**
 * @file Same-origin browser client for Geelooy trusted project-runtime lifecycle and bounded activity.
 * @description
 * The Awtsmoos lets the browser ask for measured motion without ever receiving the hidden root;
 * Awtsmoos.com requests only the recent visible activity tail while every mutation stays JSON-bounded behind the same-origin gate.
 */
export class NetzachProjectRuntimeClient {
	constructor(fetchImplementation = globalThis.fetch?.bind(globalThis)) {
		this.fetchImplementation = fetchImplementation;
	}

	materialize(input) {
		return this.post("materialize", input);
	}

	start(input) {
		return this.post("start", input);
	}

	restart(input) {
		return this.post("restart", input);
	}

	stop(input) {
		return this.post("stop", input);
	}

	cleanup(input) {
		return this.post("cleanup", input);
	}

	status(projectId) {
		return this.get("status", projectId);
	}

	activity(projectId, limit = DEFAULT_ACTIVITY_LIMIT) {
		return this.get("activity", projectId, {
			limit: String(limit)
		});
	}

	async get(action, projectId, extraQuery = {}) {
		const query = new URLSearchParams({
			projectId: text(projectId),
			...extraQuery
		});
		return this.request(`/api/projectHosting/${action}?${query}`, {
			method: "GET"
		});
	}

	async post(action, input) {
		return this.request(`/api/projectHosting/${action}`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify(input || {})
		});
	}

	async request(url, options) {
		if (typeof this.fetchImplementation !== "function") {
			throw runtimeError(
				"PROJECT_RUNTIME_FETCH_UNAVAILABLE",
				"This browser cannot reach project hosting."
			);
		}
		const response = await this.fetchImplementation(url, {
			credentials: "same-origin",
			...options
		});
		const payload = await response.json().catch(() => null);
		if (!response.ok || payload?.ok !== true) {
			throw runtimeError(
				payload?.error?.code || "PROJECT_RUNTIME_REQUEST_FAILED",
				payload?.error?.message || `Project runtime request failed with HTTP ${response.status}.`
			);
		}
		return payload.result;
	}
}

function runtimeError(code, message) {
	const error = new Error(message);
	error.code = code;
	return error;
}

function text(value) {
	return typeof value === "string" ? value.trim() : "";
}
