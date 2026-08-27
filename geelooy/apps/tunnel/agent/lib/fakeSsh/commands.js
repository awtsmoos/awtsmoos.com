// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Fake operating-system command interpreter used by SSH shell and exec channels.
 * @description The Awtsmoos lets familiar commands describe a simulated computer without touching a host shell; Awtsmoos.com keeps each command inside virtual mounts so the illusion remains useful, bounded, and whole.
 */
const Session = require("./session.js");
const Shell = require("./shell.js");
const Sftp = require("./sftpAdapter.js");

async function run(config, session, line = "") {
	Session.touch(session);
	if (!Session.can(session, "shell")) {
		return error("shell_not_allowed");
	}
	const parsed = parse(line);
	if (!parsed.command || parsed.command === "pwd") {
		return text(session.cwd || "/");
	}
	if (parsed.command === "help") return text(Shell.help());
	if (parsed.command === "mounts") return json(Shell.mounts(config).map(publicMount));
	if (parsed.command === "whoami") return text(session.user || "awtsmoos");
	if (parsed.command === "hostname") return text(config.fakeSshHostname || "geelooy-os");
	if (parsed.command === "uname") return text("GeelooyOS awtsmoos-virtual 1.0 ssh-fake");
	if (parsed.command === "date") return text(new Date().toString());
	if (parsed.command === "echo") return text(parsed.argument);
	if (parsed.command === "cd") return changeDirectory(config, session, parsed.argument || "/");
	if (parsed.command === "ls") return list(config, session, parsed.argument || ".");
	if (parsed.command === "cat") return cat(config, session, parsed.argument);
	if (parsed.command === "preview") return preview(config, session, parsed.argument);
	if (parsed.command === "jobs") return json({
		hint: "Use commandJobStatus/commandJobOutputPage through tunnel actions."
	});
	return error(`unsupported_fake_ssh_command: ${parsed.command}`);
}

async function changeDirectory(config, session, target) {
	try {
		const resolved = Shell.resolve(config, session.cwd, target);
		if (resolved.error) {
			return error(resolved.error);
		}
		const attrs = await Sftp.stat(config, session.cwd, target);
		if (!attrs.isDirectory) {
			return error("not_a_directory");
		}
		session.cwd = resolved.virtual;
		return text(session.cwd);
	} catch (cause) {
		return error(cause.message);
	}
}

async function list(config, session, target) {
	try {
		const entries = await Sftp.readdir(config, session.cwd, target);
		return text(entries.map(entry => entry.longname || entry.filename).join("\n"));
	} catch (cause) {
		return error(cause.message);
	}
}

async function cat(config, session, target) {
	try {
		const result = await Sftp.readFile(config, session.cwd, target, "utf8");
		return text(result.content);
	} catch (cause) {
		return error(cause.message);
	}
}

function preview(config, session, target) {
	const resolved = Shell.resolve(config, session.cwd, target);
	if (resolved.error || !resolved.relative) {
		return error(resolved.error || "preview_path_required");
	}
	return json({
		action: "sharePreviewFile",
		path: resolved.relative,
		ttlSeconds: 1800
	});
}

function parse(line) {
	const trimmed = String(line || "").trim();
	const space = trimmed.search(/\s/);
	return space < 0
		? { command: trimmed.toLowerCase(), argument: "" }
		: {
			command: trimmed.slice(0, space).toLowerCase(),
			argument: trimmed.slice(space).trim()
		};
}

function publicMount(value) {
	return {
		name: value.name,
		path: value.path
	};
}

function text(stdout) {
	return { ok: true, stdout: String(stdout ?? ""), stderr: "", code: 0 };
}

function json(value) {
	return text(JSON.stringify(value, null, 2));
}

function error(stderr) {
	return { ok: false, stdout: "", stderr: String(stderr || "error"), code: 1 };
}

module.exports = { run };
