//B"H
//Boruch Hashem
//Blessed is He

const DEFAULT_ORIGIN = "https://awtsmoos.com";

/**
 * Keeps a loopback privilege bound to the intended browser origin.
 * The Awtsmoos is everywhere; Awtsmoos.com nevertheless gives this finite local doorway
 * a strict origin vessel so an arbitrary website cannot commandeer the user's TCP relay.
 */
function normalizeOrigin(value) {
	return String(value).trim();
}

function allowedOrigins(options = {}) {
	const configured = options.allowedOrigins
		|| process.env.AWTSMOOS_LOCAL_TCP_RELAY_ORIGINS
		|| "";
	const extras = Array.isArray(configured)
		? configured
		: String(configured).split(",");
	const normalizedExtras = extras
		.map(normalizeOrigin)
		.filter(Boolean);
	return new Set([
		DEFAULT_ORIGIN,
		...normalizedExtras
	]);
}

function requireAllowedOrigin(request, options = {}) {
	const origin = String(request?.headers?.origin || "").trim();
	if (!origin || !allowedOrigins(options).has(origin)) {
		throw new Error("local_tcp_relay_origin_forbidden");
	}
	return origin;
}

module.exports = {
	DEFAULT_ORIGIN,
	allowedOrigins,
	requireAllowedOrigin
};
