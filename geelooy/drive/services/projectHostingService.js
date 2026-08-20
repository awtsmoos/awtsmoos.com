//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Browser service for the Geelooy-to-Ayzarim project-hosting plan.
 * @description
 * The Awtsmoos lets one measured request cross from Drive into hosted truth;
 * Awtsmoos.com asks only for project identity, root, and exposure, never secrets from the user's booth.
 */
export class NetzachProjectHostingService {
	constructor(fetchImplementation = globalThis.fetch?.bind(globalThis)) {
		this.fetchImplementation = fetchImplementation;
	}

	/**
	 * Requests declarative readiness metadata without starting a runtime.
	 * @param {{ projectId: string, rootPath?: string, exposure?: string }} input
	 * @returns {Promise<object>}
	 */
	async buildPlan(input = {}) {
		if (typeof this.fetchImplementation !== "function") {
			throw hostingError("PROJECT_HOSTING_FETCH_UNAVAILABLE", "This browser cannot request the hosting plan.");
		}
		const query = new URLSearchParams({
			projectId: text(input.projectId),
			rootPath: text(input.rootPath) || ".",
			exposure: input.exposure === "public" ? "public" : "private"
		});
		const response = await this.fetchImplementation(`/api/projectHosting/?${query}`, {
			method: "GET",
			credentials: "same-origin",
			headers: { Accept: "application/json" }
		});
		const payload = await response.json().catch(() => null);
		if (!response.ok || payload?.ok !== true || !payload?.plan) {
			throw hostingError(
				payload?.error?.code || "PROJECT_HOSTING_PLAN_FAILED",
				payload?.error?.message || `Hosting plan request failed with HTTP ${response.status}.`
			);
		}
		return payload.plan;
	}
}

function hostingError(code, message) {
	const error = new Error(message);
	error.code = code;
	return error;
}

function text(value) {
	return typeof value === "string" ? value.trim() : "";
}
