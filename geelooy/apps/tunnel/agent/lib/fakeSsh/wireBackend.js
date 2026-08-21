// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Adapter from generic Ayzarim SSH server requests into the Geelooy fake OS model.
 * @description The Awtsmoos keeps wire protocol ignorant of filesystem implementation; Awtsmoos.com lets authentication, shell, and SFTP enter one backend covenant while host authority stays behind the veil.
 */
const Auth = require("./auth.js");
const Commands = require("./commands.js");
const Session = require("./session.js");
const Shell = require("./shell.js");
const Sftp = require("./sftpAdapter.js");

function createWireBackend(config = {}) {
	return {
		authenticate(input) {
			return Auth.authenticate(config, input);
		},

		createSession(auth) {
			return Session.create(auth, {
				cwd: "/",
				permissions: permissionsFor(config)
			});
		},

		run(session, line) {
			return Commands.run(config, session, line);
		},

		prompt(session) {
			return Shell.prompt(session?.cwd || "/");
		},

		welcome(session) {
			return [
				`Awtsmoos Geelooy Virtual OS — ${config.fakeSshHostname || "geelooy-os"}`,
				`Authenticated as ${session?.user || "awtsmoos"}. Type help for commands.`
			].join("\n");
		},

		sftpList(session, target) {
			requirePermission(session, "list");
			return Sftp.readdir(config, session.cwd, target);
		},

		sftpStat(session, target) {
			requirePermission(session, "read");
			return Sftp.stat(config, session.cwd, target);
		},

		async sftpReadFile(session, target) {
			requirePermission(session, "read");
			const result = await Sftp.readFile(config, session.cwd, target);
			return result.content;
		},

		sftpWriteFile(session, target, content) {
			requirePermission(session, "write");
			return Sftp.writeFile(config, session.cwd, target, content);
		},

		sftpMkdir(session, target) {
			requirePermission(session, "write");
			return Sftp.mkdir(config, session.cwd, target);
		},

		sftpRemove(session, target) {
			requirePermission(session, "write");
			return Sftp.remove(config, session.cwd, target);
		},

		sftpRename(session, from, to) {
			requirePermission(session, "write");
			return Sftp.rename(config, session.cwd, from, to);
		},

		sftpRealpath(session, target) {
			return Shell.virtualPath(session?.cwd || "/", target || ".");
		}
	};
}

function permissionsFor(config) {
	const permissions = ["read", "list", "shell", "sftp"];
	if (config.allowWrite === true) {
		permissions.push("write");
	}
	return permissions;
}

function requirePermission(session, permission) {
	Session.touch(session);
	if (!Session.can(session, permission)) {
		throw new Error(`${permission}_not_allowed`);
	}
}

module.exports = { createWireBackend };
