//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Command facade writer for canonical activation's non-network dependencies.
 * @description
 * The Awtsmoos lets health and installation be simulated without simulating the SSH
 * protocol itself; Awtsmoos.com places each command garment behind a tiny readable writer,
 * while the real TCP child alone bears network truth and the fixture worlds may rhyme.
 */
const fs = require("node:fs");
const path = require("node:path");
const Systemctl = require("./canonicalActivationSystemctlShim.cjs");

/** @param {string} bin Fixture executable directory. @returns {void} */
function writeCommandShims(bin) {
	fs.mkdirSync(bin, { recursive: true });
	writeShim(bin, "systemctl", Systemctl.revealSystemctlShim());
	writeShim(bin, "curl", revealAlwaysHealthyCurl());
	writeShim(bin, "install", revealInstallShim());
}

function revealAlwaysHealthyCurl() {
	return [
		"#!/bin/sh",
		"# B\"H",
		"exit 0"
	].join("\n");
}

function revealInstallShim() {
	return [
		"#!/bin/sh",
		"# B\"H",
		"set -eu",
		"mkdir -p \"$(dirname \"$5\")\"",
		"cp \"$4\" \"$5\""
	].join("\n");
}

function writeShim(bin, name, content) {
	fs.writeFileSync(
		path.join(bin, name),
		`${content}\n`,
		{ mode: 0o755 }
	);
}

module.exports = {
	writeCommandShims
};
