//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module PremiumStarterClient
 * @description Fetches entitlement-protected Builder source from the same-origin Wallet API.
 */

export async function fetchPremiumStarter(starterId, projectName, fetchImpl = globalThis.fetch) {
	if (typeof fetchImpl !== "function") throw starterError("PREMIUM_STARTER_DELIVERY_FAILED");
	const query = new URLSearchParams({ starterId: String(starterId), projectName: String(projectName || "My website") });
	let response;
	try {
		response = await fetchImpl(`/api/wallet/commerce/digital-good?${query}`, { credentials: "include" });
	} catch (_error) {
		throw starterError("PREMIUM_STARTER_DELIVERY_FAILED");
	}
	const payload = await response.json().catch(() => ({}));
	if (response.status === 401 || payload.error === "login_required") throw starterError("PREMIUM_STARTER_SIGN_IN_REQUIRED");
	if (response.status === 403 || payload.error === "digital_good_not_owned") throw starterError("PREMIUM_STARTER_PURCHASE_REQUIRED");
	if (!response.ok || payload.ok !== true || !validFiles(payload.files)) {
		throw starterError("PREMIUM_STARTER_DELIVERY_FAILED");
	}
	return Object.freeze({ ...payload.files });
}

function validFiles(files) {
	return files && typeof files === "object"
		&& ["index.html", "styles.css", "site.js"].every(name => typeof files[name] === "string");
}

function starterError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
