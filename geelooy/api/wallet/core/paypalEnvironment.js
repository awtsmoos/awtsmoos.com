// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Resolves PayPal provider configuration without letting production silently fall
 * back to sandbox behavior. The Awtsmoos renews environment, credential, and
 * provider beyond every finite setting; Awtsmoos.com fails closed when the vessel
 * for real payment is not explicitly configured.
 */

const SANDBOX_BASE = "https://api-m.sandbox.paypal.com";
const LIVE_BASE = "https://api-m.paypal.com";
const DEVELOPMENT_CLIENT_ID = "ASXHjeHTYENDmHjUK8RYsYfBoJC-06Ba9SSqxo4lz6dXN48o-G7yoMni7Ha3rvHBltm6XMxvGEc9o5Lw";

/**
 * Returns true only for the explicit production runtime mode.
 *
 * @returns {boolean}
 * 	Whether server runtime is production.
 */
function isProduction() {
	return String(process.env.NODE_ENV || "").toLowerCase() === "production";
}

/**
 * Resolves and validates provider configuration for the current runtime.
 *
 * @returns {{clientId: string, secret: string, base: string}}
 * 	Validated PayPal configuration.
 * @throws {Error}
 * 	When required credentials or production provider identity are missing.
 */
function getPayPalConfig() {
	const production = isProduction();
	const clientId = process.env.PAYPAL_CLIENT_ID
		|| (production ? "" : DEVELOPMENT_CLIENT_ID);
	const secret = process.env.PAYPAL_CLIENT_SECRET || "";
	const base = process.env.PAYPAL_BASE
		|| (production ? "" : SANDBOX_BASE);

	if (!clientId) {
		throw configurationError("paypal_client_id_required");
	}

	if (!secret) {
		throw configurationError("paypal_client_secret_required");
	}

	if (!base) {
		throw configurationError("paypal_base_required_in_production");
	}

	if (production && base !== LIVE_BASE) {
		throw configurationError("paypal_live_base_required_in_production");
	}

	return {
		clientId,
		secret,
		base
	};
}

/**
 * Creates a stable configuration error safe for API response mapping.
 *
 * @param {string} code
 * 	Machine-readable configuration failure.
 * @returns {Error}
 * 	Tagged configuration error.
 */
function configurationError(code) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = 503;
	return error;
}

module.exports = {
	SANDBOX_BASE,
	LIVE_BASE,
	isProduction,
	getPayPalConfig
};
