//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Command facade writer for canonical activation's non-network dependencies.
 * @description
 * The Awtsmoos lets production paths appear inside a harmless test vessel; Awtsmoos.com
 * rehearses systemd installation faithfully without touching the host's sacred filesystem shell.
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

/** @returns {string} Curl shim that proves the fixture's HTTP world healthy. */
function revealAlwaysHealthyCurl() {
	return [
		"#!/bin/sh",
		"# B\"H",
		"exit 0"
	].join("\n");
}

/** @returns {string} Install shim supporting file copies with optional -D/-m and -d. */
function revealInstallShim() {
	return [
		"#!/bin/sh",
		"# B\"H",
		"set -eu",
		"directory_mode=0",
		"source_path=",
		"target_path=",
		"while [ \"$#\" -gt 0 ]; do",
		"\tcase \"$1\" in",
		"\t\t-D) shift ;;",
		"\t\t-d) directory_mode=1; shift ;;",
		"\t\t-m) shift; [ \"$#\" -gt 0 ]; shift ;;",
		"\t\t--) shift; break ;;",
		"\t\t-*) shift ;;",
		"\t\t*)",
		"\t\t\tif [ -z \"$source_path\" ]; then source_path=\"$1\"; else target_path=\"$1\"; fi",
		"\t\t\tshift",
		"\t\t\t;;",
		"\tesac",
		"done",
		"case \"${target_path:-$source_path}\" in",
		"\t/etc/systemd/system/*) target_path=\"$TEST_REPO/.git/fixture-systemd/${target_path##*/}\" ;;",
		"esac",
		"if [ \"$directory_mode\" -eq 1 ]; then mkdir -p \"${target_path:-$source_path}\"; exit 0; fi",
		"[ -n \"$source_path\" ]",
		"[ -n \"$target_path\" ]",
		"mkdir -p \"$(dirname \"$target_path\")\"",
		"cp \"$source_path\" \"$target_path\""
	].join("\n");
}

/** @param {string} bin Directory. @param {string} name Name. @param {string} content Body. @returns {void} */
function writeShim(bin, name, content) {
	fs.writeFileSync(path.join(bin, name), `${content}\n`, { mode: 0o755 });
}

module.exports = {
	writeCommandShims
};
