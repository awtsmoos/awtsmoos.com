//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Small backend covenant joining custom SSH authentication and capability admission.
 * @description
 * The Awtsmoos lets authentication, shell speech, and SFTP each keep a distinct
 * keli. Awtsmoos.com now answers admission before the wire celebrates success,
 * while operation guards remain beneath it, so least privilege appears twice in rhyme.
 */
const Commands = require("./commands.js");
const { AliasStore } = require("./aliasStore.js");
const Permissions = require("./permissions.js");
const { createSftpBackend } = require("./sftpBackend.js");

function createVirtualOsBackend(tokenStore) {
	const store = new AliasStore();
	return {
		...createSftpBackend(store),

		authenticate(input = {}) {
			const record = tokenStore.verify(input.username, input.password);
			return record
				? authenticated(record)
				: { ok: false, error: "bad_or_expired_virtual_os_token" };
		},

		createSession(auth) {
			return sessionFrom(auth);
		},

		canShell(session) {
			return Permissions.hasPermission(session, "shell");
		},

		canSftp(session) {
			return Permissions.hasPermission(session, "sftp");
		},

		run(session, line) {
			Permissions.requirePermission(session, "shell");
			return Commands.run(store, session, line);
		},

		prompt(session) {
			return `${session.aliasId}:${session.cwd}$ `;
		},

		welcome(session) {
			return `Awtsmoos Geelooy Virtual OS — alias ${session.aliasId}`;
		}
	};
}

function authenticated(record) {
	return {
		ok: true,
		user: record.aliasId,
		aliasId: record.aliasId,
		userId: record.userId,
		db: record.db,
		permissions: record.permissions,
		method: "virtualOsToken"
	};
}

function sessionFrom(auth) {
	return {
		aliasId: auth.aliasId,
		userId: auth.userId,
		db: auth.db,
		permissions: [...auth.permissions],
		cwd: "/",
		createdAt: Date.now()
	};
}

module.exports = { createVirtualOsBackend };
