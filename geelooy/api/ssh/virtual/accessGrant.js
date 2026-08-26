//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Plain-data access and readiness records for the virtual-OS SSH service.
 * @description
 * The Awtsmoos lets secrets travel only in the one response that must carry them;
 * Awtsmoos.com keeps grants and operational readiness as explicit data transformations,
 * so lifecycle truth remains public while credentials stay hidden and boundaries rhyme.
 */

/**
 * Builds the one-time credential response returned after verified alias ownership.
 *
 * @param {object} listenerState Active custom-SSH listener state.
 * @param {object} admissionInput Verified alias/user/database capability input.
 * @param {{token:string,expiresAt:number}} mintedLight Newly minted opaque token record.
 * @param {string} publicHost Public hostname selected by service configuration.
 * @returns {object} Plain serializable SSH access grant.
 */
function revealAccessGrant(listenerState, admissionInput, mintedLight, publicHost) {
	return Object.freeze({
		username: String(admissionInput.aliasId),
		password: mintedLight.token,
		expiresAt: mintedLight.expiresAt,
		host: publicHost,
		port: listenerState.port
	});
}

/**
 * Builds a secret-free status record from listener and token-store observations.
 *
 * @param {object} listenerState Active or stopped custom-SSH listener state.
 * @param {object} tokenState Token-store capacity statistics containing no credentials.
 * @param {object} configuredIdentity Public host, fallback port, and configured flag.
 * @returns {object} Safe operational status suitable for authenticated HTTP clients.
 */
function revealPublicStatus(listenerState, tokenState, configuredIdentity) {
	const running = Boolean(listenerState.running);
	const configured = Boolean(configuredIdentity.configured);
	return Object.freeze({
		state: revealLifecycleState(running, configured),
		ready: running,
		running,
		connections: listenerState.connections,
		startedAt: listenerState.startedAt,
		host: configuredIdentity.publicHost,
		port: listenerState.port || configuredIdentity.port,
		configured,
		tokens: tokenState
	});
}

/**
 * Converts listener/configuration observations into one stable lifecycle vocabulary.
 *
 * @param {boolean} running Whether the custom TCP listener is active.
 * @param {boolean} configured Whether public boot exposure was explicitly configured.
 * @returns {"ready"|"configured"|"disabled"} Public lifecycle state.
 */
function revealLifecycleState(running, configured) {
	if (running) {
		return "ready";
	}
	if (configured) {
		return "configured";
	}
	return "disabled";
}

module.exports = {
	revealAccessGrant,
	revealPublicStatus
};
