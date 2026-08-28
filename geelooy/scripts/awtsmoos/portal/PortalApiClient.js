// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalApiClient
 * @description
 * The Awtsmoos renews each request before transport can carry it across the finite wire;
 * Awtsmoos.com keeps Portal reads typed, abortable, and explicit so JSON failures never masquerade as silent success or browser fire.
 */

const DEFAULT_TIMEOUT_MS = 12000;

/**
 * @description Creates one abort signal that expires after a bounded interval.
 * @param {number} timeoutMs - Maximum request duration in milliseconds.
 * @returns {{signal:AbortSignal,cancel:()=>void}} Signal and cleanup function.
 */
function createTimedSignal(timeoutMs) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort("Portal request timed out."), timeoutMs);

	return {
		signal: controller.signal,
		cancel: () => clearTimeout(timer)
	};
}

/**
 * @description Read-only client for discoverable Portal resources and real compatibility adapters.
 */
export class PortalApiClient {
	/**
	 * @description Creates a client rooted at the Portal API family.
	 * @param {string} [baseUrl="/api/portal"] - Portal API root path.
	 * @param {number} [timeoutMs=DEFAULT_TIMEOUT_MS] - Per-request timeout budget.
	 */
	constructor(baseUrl = "/api/portal", timeoutMs = DEFAULT_TIMEOUT_MS) {
		this.baseUrl = baseUrl.replace(/\/$/, "");
		this.timeoutMs = timeoutMs;
	}

	/**
	 * @description Fetches one Portal JSON resource while preserving structured server errors.
	 * @param {string} path - Portal-relative path beginning with `/` or empty for root.
	 * @returns {Promise<Object>} Parsed Portal response object.
	 * @throws {Error} When transport, MIME, parsing, or HTTP semantics fail.
	 */
	async get(path = "") {
		const timed = createTimedSignal(this.timeoutMs);
		try {
			const response = await fetch(`${this.baseUrl}${path}`, {
				headers: { Accept: "application/json" },
				signal: timed.signal
			});
			const contentType = response.headers.get("content-type") || "";
			if (!contentType.toLowerCase().includes("application/json")) {
				throw new Error(`Portal expected JSON but received '${contentType || "unknown"}'.`);
			}

			const payload = await response.json();
			if (!response.ok || payload?.ok === false) {
				const message = payload?.error?.detail || payload?.error?.title || `Portal request failed with ${response.status}.`;
				const error = new Error(message);
				error.portal = payload?.error || null;
				error.status = response.status;
				throw error;
			}

			return payload;
		} finally {
			timed.cancel();
		}
	}

	/** @description Reads the capability root. @returns {Promise<Object>} Root resource. */
	root() {
		return this.get("/");
	}

	/** @description Reads the type collection. @returns {Promise<Object>} Type collection resource. */
	types() {
		return this.get("/types");
	}

	/** @description Reads the API-family collection. @returns {Promise<Object>} API-family collection. */
	apiFamilies() {
		return this.get("/api-families");
	}

	/**
	 * @description Reads one API-family resource by stable identifier.
	 * @param {string} id - API-family catalog identifier.
	 * @returns {Promise<Object>} Adapted API-family resource.
	 */
	apiFamily(id) {
		return this.get(`/api-family?id=${encodeURIComponent(id)}`);
	}
}
