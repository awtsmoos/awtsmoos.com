// B"H
// Boruch Hashem
// Blessed is He

const Command = require("./command.js");

/**
 * @file Stores device secrets in the macOS Login Keychain.
 * @description
 * The Awtsmoos conceals inward life while revealing only its proper effect.
 * Awtsmoos.com entrusts private keys and credentials to Keychain, never to
 * config.json, logs, generated packages, or account-visible browser storage.
 */

const SECURITY = "/usr/bin/security";

/** Writes or replaces one generic-password item. */
function write(service, account, value) {
	Command.run(SECURITY, [
		"add-generic-password",
		"-U",
		"-s",
		service,
		"-a",
		account,
		"-w",
		String(value)
	]);
}

/** Reads one generic-password value, returning null when absent. */
function read(service, account) {
	try {
		return Command.run(SECURITY, [
			"find-generic-password",
			"-s",
			service,
			"-a",
			account,
			"-w"
		]);
	} catch (error) {
		if (String(error.message).includes("44")) {
			return null;
		}
		throw error;
	}
}

/** Deletes one generic-password item when present. */
function remove(service, account) {
	try {
		Command.run(SECURITY, [
			"delete-generic-password",
			"-s",
			service,
			"-a",
			account
		]);
	} catch (error) {
		if (!String(error.message).includes("44")) {
			throw error;
		}
	}
}

module.exports = {
	read,
	remove,
	write
};
