// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Read-only fake SSH introspection actions for mounts, paths, help, and guarded file reads.
 * @description The Awtsmoos lets operators inspect the simulated computer without granting mutation; Awtsmoos.com reveals virtual topology and readable content through the same guarded adapter used by wire clients.
 */
const Shell = require("../../../lib/fakeSsh/shell.js");
const Sftp = require("../../../lib/fakeSsh/sftpAdapter.js");

function buildIntrospectionActions(ctx) {
	const { config, payload = {} } = ctx;
	return {
		async fakeSshMounts() {
			return {
				ok: true,
				action: "fakeSshMounts",
				mounts: Shell.mounts(config).map(item => ({ name: item.name, path: item.path })),
				prompt: Shell.prompt(payload.cwd || "/")
			};
		},

		async fakeSshResolve() {
			const resolved = Shell.resolve(config, payload.cwd || "/", target(payload));
			return {
				ok: !resolved.error,
				action: "fakeSshResolve",
				resolved: publicResolution(resolved)
			};
		},

		async fakeSshHelp() {
			return {
				ok: true,
				action: "fakeSshHelp",
				help: Shell.help()
			};
		},

		async fakeSshRead() {
			try {
				const got = await Sftp.readFile(config, payload.cwd || "/", target(payload), "utf8");
				return {
					ok: true,
					action: "fakeSshRead",
					virtual: got.path,
					content: got.content
				};
			} catch (error) {
				return {
					ok: false,
					action: "fakeSshRead",
					error: error?.message || String(error)
				};
			}
		}
	};
}

function target(payload) {
	return payload.path || payload.p || ".";
}

function publicResolution(value = {}) {
	return {
		virtual: value.virtual,
		mount: value.mount,
		mountPath: value.mountPath,
		relative: value.relative,
		synthetic: value.synthetic === true,
		error: value.error
	};
}

module.exports = { buildIntrospectionActions };
