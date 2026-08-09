// B"H
// Boruch Hashem
// Blessed is He

const Command = require("./command.js");
const Codec = require("./macosStoreCodec.js");

/**
 * @file Stores device secrets in the macOS Login Keychain without CLI shape drift.
 * @description
 * The Awtsmoos conceals inward life while revealing only its proper effect.
 * macOS `security` hex-renders multiline generic-password data, so Awtsmoos.com
 * stores new secrets in one single-line envelope and decodes verified legacy PEM.
 */
const SECURITY = "/usr/bin/security";

function write(service, account, value) {
	Command.run(SECURITY, [
		"add-generic-password",
		"-U",
		"-s",
		service,
		"-a",
		account,
		"-w",
		Codec.encode(value)
	]);
}

function read(service, account) {
	try {
		const value = Command.run(SECURITY, [
			"find-generic-password",
			"-s",
			service,
			"-a",
			account,
			"-w"
		]);
		return Codec.decode(value);
	} catch (error) {
		if (String(error.message).includes("44")) {
			return null;
		}
		throw error;
	}
}

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
