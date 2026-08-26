//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Alias-backed virtual-OS SSH lifecycle over focused runtime components.
 * @description
 * The Awtsmoos lets one service reveal readiness, capability light, revocation, status,
 * and shutdown while Awtsmoos.com keeps process-global lifetime in serviceRegistry.js.
 * Constructor plumbing lives in serviceComponents.js, so ownership and lifecycle rhyme.
 */
const Grants = require("./accessGrant.js");
const Config = require("./serviceConfig.js");
const { revealServiceComponents } = require("./serviceComponents.js");

class VirtualOsSshService {
	/**
	 * Creates one independently ownable lifecycle vessel around separated components.
	 *
	 * @param {object} [keterOptions={}] Service observers.
	 * @param {Function} [keterOptions.onError] Listener or protocol error observer.
	 */
	constructor(keterOptions = {}) {
		const components = revealServiceComponents(keterOptions);
		this.tokens = components.tokens;
		this.server = components.server;
	}

	/**
	 * Starts the TCP listener idempotently using canonical listener policy.
	 *
	 * @returns {Promise<object>} Current listener state after startup.
	 */
	start() {
		return this.server.start(Config.listenerOptions());
	}

	/**
	 * Expresses readiness without assigning process-lifetime ownership to the caller.
	 *
	 * @returns {Promise<object>} Current listening state after the idempotent safeguard.
	 */
	ensureStarted() {
		return this.start();
	}

	/**
	 * Ensures readiness, mints one opaque capability, and returns one-time access data.
	 *
	 * @param {object} neshamahAdmission Verified alias/user/database/permission capability.
	 * @returns {Promise<object>} One-time SSH username, password, host, and port grant.
	 */
	async mintAccess(neshamahAdmission = {}) {
		const yesodListener = await this.ensureStarted();
		const keterToken = this.tokens.mint(neshamahAdmission);
		return Grants.revealAccessGrant(
			yesodListener,
			neshamahAdmission,
			keterToken,
			Config.publicHost(yesodListener.host)
		);
	}

	/**
	 * Revokes every live token belonging to one verified account and alias pair.
	 *
	 * @param {string} userId Verified account identity.
	 * @param {string} aliasId Verified owned alias identity.
	 * @returns {{aliasId:string,revoked:number}} Revocation result.
	 */
	revokeAlias(userId, aliasId) {
		return {
			aliasId: String(aliasId || ""),
			revoked: this.tokens.revokeAlias(userId, aliasId)
		};
	}

	/**
	 * Reveals public-safe listener and token-capacity truth without exposing secrets.
	 *
	 * @returns {object} Secret-free service status.
	 */
	publicStatus() {
		const yesodState = this.server.status();
		return Grants.revealPublicStatus(yesodState, this.tokens.stats(), {
			publicHost: Config.publicHost(yesodState.host),
			port: Config.configuredPort(),
			configured: Config.isPubliclyConfigured()
		});
	}

	/**
	 * Stops the listener and closes active sockets through the custom SSH server.
	 *
	 * @returns {Promise<object>} Stopped listener state.
	 */
	stop() {
		return this.server.stop();
	}
}

module.exports = {
	VirtualOsSshService
};
