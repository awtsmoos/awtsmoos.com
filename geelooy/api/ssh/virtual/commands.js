//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Bounded human shell commands over one alias-backed virtual filesystem.
 * @description
 * The Awtsmoos lets a real SSH client speak to Geelooy without borrowing the
 * host machine's shell. Awtsmoos.com routes navigation and filesystem speech
 * through the alias store alone, so the simulated computer stays safely in rhyme.
 */
const Content = require("./aliasContent.js");
const Path = require("./aliasPath.js");
const Parser = require("./shellParser.js");

const HELP = "help pwd ls cd cat mkdir rm mv echo";

async function run(store, session, line = "") {
	const parsed = Parser.parse(line);
	try {
		const stdout = await execute(store, session, parsed.command, parsed.args);
		return { ok: true, stdout: String(stdout ?? ""), stderr: "", code: 0 };
	} catch (error) {
		return {
			ok: false,
			stdout: "",
			stderr: error?.message || String(error),
			code: 1
		};
	}
}

async function execute(store, session, command, args) {
	if (!command || command === "help") {
		return HELP;
	}
	if (command === "pwd") {
		return session.cwd;
	}
	if (command === "echo") {
		return args.join(" ");
	}
	if (command === "ls") {
		const entries = await store.list(session, args[0] || ".");
		return entries.map(entry => entry.longname || entry.filename).join("\n");
	}
	if (command === "cd") {
		return changeDirectory(store, session, args[0] || "/");
	}
	if (command === "cat") {
		return catFile(store, session, required(args, 0, "cat path"));
	}
	if (command === "mkdir") {
		await store.mkdir(session, required(args, 0, "mkdir path"));
		return "created";
	}
	if (command === "rm") {
		return removePath(store, session, required(args, 0, "rm path"));
	}
	if (command === "mv") {
		await store.rename(
			session,
			required(args, 0, "mv source"),
			required(args, 1, "mv destination")
		);
		return "renamed";
	}
	throw new Error(`virtual_command_not_supported:${command}`);
}

async function changeDirectory(store, session, target) {
	const attrs = await store.stat(session, target);
	if (!attrs.isDirectory) {
		throw new Error("virtual_cd_requires_directory");
	}
	session.cwd = Path.virtualPath(session.cwd, target);
	return session.cwd;
}

async function catFile(store, session, target) {
	const attrs = await store.stat(session, target);
	if (attrs.isDirectory) {
		throw new Error("virtual_cat_rejects_directory");
	}
	return Content.toBuffer(await store.readFile(session, target)).toString("utf8");
}

async function removePath(store, session, target) {
	const attrs = await store.stat(session, target);
	if (attrs.isDirectory) {
		const entries = await store.list(session, target);
		if (entries.length) {
			throw new Error("virtual_directory_not_empty");
		}
	}
	await store.remove(session, target);
	return "removed";
}

function required(args, index, label) {
	const value = args[index];
	if (!value) {
		throw new Error(`${label} is required`);
	}
	return value;
}

module.exports = { run };
