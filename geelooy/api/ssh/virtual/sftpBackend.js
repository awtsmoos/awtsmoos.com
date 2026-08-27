//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file SFTP capability facade over one permission-aware alias store.
 * @description
 * The Awtsmoos lets binary file transport wear its own keli apart from shell
 * speech. Awtsmoos.com checks the SFTP gate, preserves structured DosDB identity,
 * and delegates path law to the shared alias store so every byte stays in rhyme.
 */
const Content = require("./aliasContent.js");
const Path = require("./aliasPath.js");
const Permissions = require("./permissions.js");

function createSftpBackend(store) {
	return {
		sftpList(session, target) {
			requireSftp(session);
			return store.list(session, target);
		},

		sftpStat(session, target) {
			requireSftp(session);
			return store.stat(session, target);
		},

		async sftpReadFile(session, target) {
			requireSftp(session);
			return Content.toBuffer(
				await store.readFile(session, target)
			);
		},

		async sftpWriteFile(session, target, incoming) {
			requireSftp(session);
			const existing = await readExisting(store, session, target);
			return store.writeFile(
				session,
				target,
				Content.forWrite(existing, incoming)
			);
		},

		sftpMkdir(session, target) {
			requireSftp(session);
			return store.mkdir(session, target);
		},

		sftpRemove(session, target) {
			requireSftp(session);
			return store.remove(session, target);
		},

		sftpRename(session, from, to) {
			requireSftp(session);
			return store.rename(session, from, to);
		},

		sftpRealpath(session, target) {
			requireSftp(session);
			return Path.virtualPath(session.cwd, target || ".");
		}
	};
}

function requireSftp(session) {
	Permissions.requirePermission(session, "sftp");
}

async function readExisting(store, session, target) {
	try {
		return await store.readFile(session, target);
	} catch (_) {
		return null;
	}
}

module.exports = { createSftpBackend };
