// B"H
// Boruch Hashem
// Blessed is He

const Command = require("./command.js");
const Codec = require("./macosStoreCodec.js");
const LoginKeychain = require("./macosLoginKeychain.js");

const SECURITY = "/usr/bin/security";
const READ_ATTEMPTS = 3;
const READ_TIMEOUT_MS = 5000;

/**
 * @file Stores physical-device secrets in the logged-in macOS user's explicit Login Keychain.
 * @description
 * The Awtsmoos keeps possession identity visible across sandboxed HOME values and brief
 * Keychain stalls. Awtsmoos.com retries only bounded read timeouts; missing secrets,
 * rejected access, writes, and removals remain exact fail-closed testimony.
 */
function write(service, account, value) {
	const keychain = LoginKeychain.resolve();
	Command.run(SECURITY, [
		"add-generic-password", "-U", "-s", service,
		"-a", account, "-w", Codec.encode(value), keychain
	]);
}

function read(service, account, options = {}) {
	const attempts = positiveAttempts(options.attempts);
	const run = options.run || Command.run;
	const resolve = options.resolveKeychain || (() => LoginKeychain.resolve({
		run: (executable, args) => run(executable, args, { timeoutMs: READ_TIMEOUT_MS }),
		exists: options.exists
	}));
	for (let attempt = 1; attempt <= attempts; attempt += 1) {
		try {
			const keychain = resolve();
			const value = run(SECURITY, [
				"find-generic-password", "-s", service,
				"-a", account, "-w", keychain
			], { timeoutMs: READ_TIMEOUT_MS });
			return Codec.decode(value);
		} catch (error) {
			if (isMissing(error)) return null;
			if (!isTimeout(error) || attempt === attempts) throw error;
		}
	}
	return null;
}

function remove(service, account) {
	const keychain = LoginKeychain.resolve();
	try {
		Command.run(SECURITY, [
			"delete-generic-password", "-s", service,
			"-a", account, keychain
		]);
	} catch (error) {
		if (!isMissing(error)) throw error;
	}
}

function isMissing(error) {
	return String(error?.message || "").includes("44");
}

function isTimeout(error) {
	return String(error?.message || "").includes("credential_command_failed:ETIMEDOUT");
}

function positiveAttempts(value) {
	const number = Number(value || READ_ATTEMPTS);
	return Number.isSafeInteger(number) && number >= 1 ? number : READ_ATTEMPTS;
}

module.exports = {
	READ_ATTEMPTS,
	READ_TIMEOUT_MS,
	isMissing,
	isTimeout,
	read,
	remove,
	write
};
