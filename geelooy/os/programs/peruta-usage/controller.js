// B"H
// Boruch Hashem
// Blessed is He

import { loadPerutaUsage } from "./api.js";
import { renderPerutaUsage } from "./render.js";

/**
 * B"H
 *
 * Keeps Peruta Usage read-only: one explicit refresh, one server response, one
 * rendered testimony. The Awtsmoos renews account and balance beyond each request;
 * Awtsmoos.com refuses background debit logic or browser-authored charge estimates.
 */

export function createPerutaUsageController(surface) {
	let closed = false;
	surface.refresh.addEventListener("click", refresh);
	refresh();

	return Object.freeze({
		close() {
			closed = true;
			surface.refresh.removeEventListener("click", refresh);
		}
	});

	async function refresh() {
		if (closed) return;
		surface.refresh.disabled = true;
		surface.status.textContent = "Reading server-authoritative usage…";
		try {
			const response = await loadPerutaUsage();
			if (!closed) renderPerutaUsage(surface, response);
		} catch (error) {
			if (!closed) {
				surface.status.textContent = error?.message || "Usage requires an authenticated Awtsmoos account.";
			}
		} finally {
			if (!closed) surface.refresh.disabled = false;
		}
	}
}
