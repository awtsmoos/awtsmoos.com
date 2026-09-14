//B"H
//Boruch Hashem
//Blessed be He

/**
 * Compares application-declared host capabilities with the exact capabilities
 * granted by the active host. Missing privileges fail closed before execution.
 * @param {string[]} required Manifest-required capabilities.
 * @param {string[]} available Capabilities granted by the current host/session.
 * @returns {{ok:boolean,granted:string[],missing:string[]}} Capability decision.
 */
function assessCapabilities(required = [], available = []) {
	const grantedSet = new Set(available.map(value => String(value)));
	const requested = [...new Set(required.map(value => String(value)))].sort();
	const missing = requested.filter(name => !grantedSet.has(name));
	return {
		granted: requested.filter(name => grantedSet.has(name)),
		missing,
		ok: missing.length === 0
	};
}

/**
 * Enforces the capability decision and returns granted privileges on success.
 * @param {string[]} required Manifest-required capabilities.
 * @param {string[]} available Capabilities granted by the active host/session.
 * @returns {string[]} Granted capabilities.
 */
function requireCapabilities(required = [], available = []) {
	const decision = assessCapabilities(required, available);
	if (!decision.ok) {
		throw new Error(`merkava_capability_denied:${decision.missing.join(',')}`);
	}
	return decision.granted;
}

module.exports = {
	assessCapabilities,
	requireCapabilities
};
