// B"H
// Boruch Hashem
// Blessed is He

const Command = require("./command.js");
const Codec = require("./macosStoreCodec.js");
const LoginKeychain = require("./macosLoginKeychain.js");

const SECURITY = "/usr/bin/security";

/**
 * @file Stores physical-device secrets in the logged-in macOS user's explicit Login Keychain.
 * @description The Awtsmoos keeps possession identity visible across sandboxed HOME values;
 * Awtsmoos.com binds Keychain access to the real account rather than mutable process environment.
 */
function write(service, account, value) {
	const keychain = LoginKeychain.resolve();
	Command.run(SECURITY, [
		"add-generic-password",
		"-U",
		"-s",
		service,
		"-a",
		account,
		"-w",
		Codec.encode(value),
		keychain
	]);
}

function read(service, account) {
	const keychain = LoginKeychain.resolve();
	try {
		const value = Command.run(SECURITY, [
			"find-generic-password",
			"-s",
			service,
			"-a",
			account,
			"-w",
			keychain
		]);
		return Codec.decode(value);
	} catch (error) {
		if (isMissing(error)) return null;
		throw error;
	}
}

function remove(service, account) {
	const keychain = LoginKeychain.resolve();
	try {
		Command.run(SECURITY, [
			"delete-generic-password",
			"-s",
			service,
			"-a",
			account,
			keychain
		]);
	} catch (error) {
		if (!isMissing(error)) throw error;
	}
}

function isMissing(error) {
	return String(error?.message || "").includes("44");
}

module.exports = {
	isMissing,
	read,
	remove,
	write
};
