// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Control-plane fake SFTP actions sharing the same guarded adapter as real wire clients.
 * @description The Awtsmoos lets testing actions and real SFTP drink from one filesystem gate; Awtsmoos.com keeps reads, writes, mkdir, remove, stat, and rename aligned in one fate.
 */
const Session = require("../../../../lib/fakeSsh/session.js");
const Store = require("../../../../lib/fakeSsh/sessionStore.js");
const Sftp = require("../../../../lib/fakeSsh/sftpAdapter.js");

function buildSftpActions(ctx) {
	const { config, payload = {} } = ctx;
	return {
		async fakeSshSftpList() {
			return withSession(payload, "fakeSshSftpList", async session => ({
				items: await Sftp.readdir(config, session.cwd, target(payload))
			}));
		},

		async fakeSshSftpStat() {
			return withSession(payload, "fakeSshSftpStat", async session => ({
				stat: await Sftp.stat(config, session.cwd, target(payload))
			}));
		},

		async fakeSshSftpRead() {
			return withSession(payload, "fakeSshSftpRead", async session => {
				const got = await Sftp.readFile(config, session.cwd, target(payload), "utf8");
				return got;
			});
		},

		async fakeSshSftpWrite() {
			return withSession(payload, "fakeSshSftpWrite", async session => ({
				...(await Sftp.writeFile(config, session.cwd, target(payload), content(payload))),
				readbackRequired: true
			}));
		},

		async fakeSshSftpMkdir() {
			return withSession(payload, "fakeSshSftpMkdir", session => {
				return Sftp.mkdir(config, session.cwd, target(payload));
			});
		},

		async fakeSshSftpRemove() {
			return withSession(payload, "fakeSshSftpRemove", session => {
				return Sftp.remove(config, session.cwd, target(payload));
			});
		},

		async fakeSshSftpRename() {
			return withSession(payload, "fakeSshSftpRename", session => {
				return Sftp.rename(config, session.cwd, payload.from, payload.to);
			});
		}
	};
}

async function withSession(payload, action, task) {
	const session = Store.get(payload);
	if (!session) {
		return { ok: false, action, error: "ssh_session_not_found" };
	}
	if (!Session.can(session, "sftp")) {
		return { ok: false, action, error: "sftp_not_allowed" };
	}
	try {
		return { ok: true, action, ...(await task(Session.touch(session))) };
	} catch (error) {
		return { ok: false, action, error: error?.message || String(error) };
	}
}

function target(payload) {
	return payload.path || payload.p || ".";
}

function content(payload) {
	if (payload.content64) {
		return Buffer.from(String(payload.content64), "base64");
	}
	return payload.content ?? "";
}

module.exports = { buildSftpActions };
