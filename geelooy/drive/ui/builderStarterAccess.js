//B"H
//Boruch Hashem
//Blessed be He

const BUNDLE_SKU_ID = "drive.template.propack.001";

/**
 * @module BuilderStarterAccess
 * @description Reads durable template ownership without exposing Wallet mutation authority.
 */

export async function loadBuilderStarterAccess(fetchImpl = globalThis.fetch) {
	if (typeof fetchImpl !== "function") return unknownAccess();
	try {
		const response = await fetchImpl("/api/wallet/commerce/entitlements", { credentials: "include" });
		const payload = await response.json().catch(() => ({}));
		if (!response.ok || payload.ok !== true) {
			return Object.freeze({ loaded: true, authenticated: false, owned: new Set() });
		}
		const owned = new Set((payload.entitlements || []).flatMap(item => [item.key, item.skuId]).filter(Boolean));
		return Object.freeze({ loaded: true, authenticated: true, owned });
	} catch (_error) {
		return unknownAccess();
	}
}

/** @param {object} starter Starter metadata. @param {object} access Ownership state. @returns {boolean} */
export function canUseBuilderStarter(starter, access) {
	if (!starter?.premium) return true;
	return access?.owned?.has(starter.skuId) || access?.owned?.has(BUNDLE_SKU_ID) || false;
}

function unknownAccess() {
	return Object.freeze({ loaded: false, authenticated: false, owned: new Set() });
}
