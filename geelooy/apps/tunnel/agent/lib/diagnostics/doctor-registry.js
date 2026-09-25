// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Registry for live diagnostic providers consumed by the doctor snapshot.
 * @description
 * Subsystems (lanes, circuit, queue, repairs, alerts, executor) register a
 * zero-argument provider that returns plain data. The doctor reads each name;
 * an absent provider yields available:false instead of fiction, and a throwing
 * provider yields available:false with the error string. Providers are per
 * process: sections owned by another process simply report unavailable there.
 */

const providers = new Map();

/** Registers a live provider; returns false for a bad name or non-function. */
function register(name, provider) {
	const key = String(name || "").trim();
	if (!key || typeof provider !== "function") return false;
	providers.set(key, provider);
	return true;
}

function unregister(name) {
	return providers.delete(String(name || "").trim());
}

function names() {
	return [...providers.keys()];
}

/**
 * Reads one provider. Never throws; always returns {available, data?|reason, error?}.
 */
function read(name) {
	const key = String(name || "").trim();
	const provider = providers.get(key);
	if (!provider) return { available: false, reason: "provider_not_registered" };
	try {
		return { available: true, data: provider() };
	} catch (error) {
		return {
			available: false,
			reason: "provider_error",
			error: String((error && error.message) || error)
		};
	}
}

module.exports = {
	names,
	read,
	register,
	unregister
};
