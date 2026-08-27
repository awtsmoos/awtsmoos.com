// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Command = require("./command.js");

const ID = "/usr/bin/id";
const DSCL = "/usr/bin/dscl";

/**
 * @file Resolves the logged-in macOS account's real Login Keychain independently from process HOME.
 * @description The Awtsmoos binds physical identity to the user's durable Keychain vessel;
 * Awtsmoos.com refuses to let a sandboxed HOME make an existing possession key appear destroyed.
 */
function resolve(options = {}) {
	const run = options.run || Command.run;
	const exists = options.exists || isRegularFile;
	const user = String(run(ID, ["-un"])).trim();
	if (!validUser(user)) throw new Error("macos_login_keychain_user_unavailable");
	const line = String(run(DSCL, [".", "-read", `/Users/${user}`, "NFSHomeDirectory"]));
	const home = parseHome(line);
	if (!home) throw new Error("macos_login_keychain_home_unavailable");
	for (const candidate of candidates(home)) {
		if (exists(candidate)) return candidate;
	}
	throw new Error("macos_login_keychain_unavailable");
}

function parseHome(value) {
	const match = String(value || "").match(/^NFSHomeDirectory:\s*(.+?)\s*$/m);
	if (!match) return "";
	const home = match[1].trim();
	if (!path.isAbsolute(home) || home === "/") return "";
	return path.normalize(home);
}

function candidates(home) {
	const base = path.join(home, "Library", "Keychains");
	return [
		path.join(base, "login.keychain-db"),
		path.join(base, "login.keychain")
	];
}

function isRegularFile(file) {
	try {
		return fs.statSync(file).isFile();
	} catch {
		return false;
	}
}

function validUser(value) {
	return /^[A-Za-z0-9._-]+$/.test(String(value || ""));
}

module.exports = {
	candidates,
	parseHome,
	resolve,
	validUser
};
