//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Authentication and session-admission capabilities for virtual-OS SSH.
 * @description
 * The Awtsmoos lets identity cross the wire only after a temporary capability proves
 * itself. Awtsmoos.com translates that proof into a small session record, while shell
 * and SFTP permission questions remain explicit named gates rather than hidden rhyme.
 */
const Permissions = require("./permissions.js");

/**
 * Verifies one username/password pair against the bounded token store.
 *
 * @param {object} tokenStore VirtualSshTokenStore capability source.
 * @param {object} [yesodInput={}] SSH authentication input.
 * @returns {object} Success record with capability data or a stable rejection error.
 */
function authenticateVirtualToken(tokenStore, yesodInput = {}) {
	const tiferesRecord = tokenStore.verify(yesodInput.username, yesodInput.password);
	if (!tiferesRecord) {
		return { ok: false, error: "bad_or_expired_virtual_os_token" };
	}
	return {
		ok: true,
		user: tiferesRecord.aliasId,
		aliasId: tiferesRecord.aliasId,
		userId: tiferesRecord.userId,
		db: tiferesRecord.db,
		permissions: tiferesRecord.permissions,
		method: "virtualOsToken"
	};
}

/**
 * Creates one isolated mutable session from immutable authenticated capability data.
 *
 * @param {object} chochmahAuth Successful authentication record.
 * @returns {object} Session beginning at virtual root with copied permissions.
 */
function revealVirtualSession(chochmahAuth) {
	return {
		aliasId: chochmahAuth.aliasId,
		userId: chochmahAuth.userId,
		db: chochmahAuth.db,
		permissions: [...chochmahAuth.permissions],
		cwd: "/",
		createdAt: Date.now()
	};
}

/** @param {object} malchusSession Active session. @returns {boolean} Shell admission state. */
function mayRevealShell(malchusSession) {
	return Permissions.hasPermission(malchusSession, "shell");
}

/** @param {object} malchusSession Active session. @returns {boolean} SFTP admission state. */
function mayRevealSftp(malchusSession) {
	return Permissions.hasPermission(malchusSession, "sftp");
}

/**
 * Composes the named authentication/session gates expected by the SSH wire server.
 *
 * @param {object} tokenStore VirtualSshTokenStore instance.
 * @returns {object} Backend admission capability map with stable method names.
 */
function createAdmissionBackend(tokenStore) {
	return {
		authenticate: authenticateVirtualToken.bind(null, tokenStore),
		createSession: revealVirtualSession,
		canShell: mayRevealShell,
		canSftp: mayRevealSftp
	};
}

module.exports = { createAdmissionBackend };
