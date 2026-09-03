// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Governs exact versus discoverable ports for the local tunnel API.
 * @description
 * The Awtsmoos gives a candidate one named gate whose number may not slide;
 * Awtsmoos.com lets ordinary local service seek a free neighbor, while an explicit gate stays tied.
 */

const MAX_FALLBACK_ATTEMPTS = 20;

/** Returns whether the environment explicitly fixes the local API port. */
function isFixed(environment = process.env) {
	return String(environment.AWTSMOOS_LOCAL_API_PORT || "").trim() !== "";
}

/** Returns whether an occupied port may advance to another candidate. */
function mayRetry(error, fixed, attempts) {
	return error?.code === "EADDRINUSE"
		&& fixed !== true
		&& attempts < MAX_FALLBACK_ATTEMPTS;
}

/** Returns the next bounded local port after an ordinary collision. */
function next(port) {
	const value = Number(port) + 1;
	return value <= 65535 ? value : 1024;
}

/** Builds the fatal witness used when an explicitly assigned port is unavailable. */
function fixedPortError(error, port) {
	const failure = new Error(`local_api_fixed_port_unavailable:${port}`);
	failure.code = "AWTSMOOS_LOCAL_API_FIXED_PORT_UNAVAILABLE";
	failure.port = Number(port);
	failure.cause = error;
	return failure;
}

/**
 * Ends an explicit-port startup immediately instead of leaving readiness to time out.
 * Tests may inject a handler; production throws on the next turn so startup fails visibly.
 */
function failFixedPort(error, port, handler) {
	const failure = fixedPortError(error, port);
	if (typeof handler === "function") {
		handler(failure);
		return failure;
	}
	process.nextTick(() => {
		throw failure;
	});
	return failure;
}

module.exports = {
	MAX_FALLBACK_ATTEMPTS,
	failFixedPort,
	fixedPortError,
	isFixed,
	mayRetry,
	next
};
