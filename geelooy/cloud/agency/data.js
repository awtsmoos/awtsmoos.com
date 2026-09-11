//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module AgencyData
 * @description Owns the Agency Control Center HTTP boundary. Read operations never
 * mutate value; organization and marketplace mutations require the Wallet action
 * header and authenticated same-origin cookies.
 */

const ACTION_HEADER = "X-Awtsmoos-Wallet-Action";

/** Loads organization, marketplace, and Wallet testimony concurrently. */
export async function loadAgencyData() {
	const [organizations, marketplace, balance] = await Promise.all([
		getJson("/api/wallet/organizations"),
		getJson("/api/wallet/marketplace"),
		getJson("/api/wallet/balance")
	]);
	return Object.freeze({ organizations, marketplace, balance });
}

/** Requests one public, server-authored resource quote. */
export function quoteResource(input) {
	const query = new URLSearchParams({
		resourceId: input.resourceId,
		units: input.units,
		executionMode: input.executionMode
	});
	return getJson(`/api/wallet/resource/quote?${query}`);
}

/** Sends one guarded organization mutation. */
export function organizationAction(body) {
	return postWallet("/api/wallet/organizations/action", body);
}

/** Sends one guarded marketplace mutation. */
export function marketplaceAction(body) {
	return postWallet("/api/wallet/marketplace/action", body);
}

/** Creates a cryptographically strong retry key when available. */
export function retryKey(prefix = "agency") {
	const random = globalThis.crypto?.randomUUID?.()
		|| `${Date.now()}-${Math.random().toString(16).slice(2)}`;
	return `${prefix}-${random}`;
}

async function getJson(url) {
	try {
		const response = await fetch(url, { credentials: "include" });
		return await decode(response);
	} catch (error) {
		return Object.freeze({ ok: false, error: "network_error", detail: error.message });
	}
}

async function postWallet(url, body) {
	try {
		const response = await fetch(url, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
				[ACTION_HEADER]: "1"
			},
			body: new URLSearchParams(body).toString()
		});
		return await decode(response);
	} catch (error) {
		return Object.freeze({ ok: false, error: "network_error", detail: error.message });
	}
}

async function decode(response) {
	const text = await response.text();
	try {
		const payload = JSON.parse(text);
		return Object.freeze({ ...payload, httpStatus: response.status });
	} catch {
		return Object.freeze({
			ok: false,
			error: text || `http_${response.status}`,
			httpStatus: response.status
		});
	}
}
