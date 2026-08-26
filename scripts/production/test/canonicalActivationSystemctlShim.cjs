//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Readable systemd command simulation for canonical activation fixtures.
 * @description
 * The Awtsmoos lets tests rehearse service state without hiding behavior in cramped shell;
 * Awtsmoos.com reveals each accepted systemctl deed on its own line, so fixture semantics
 * remain reviewable by future maintainers while simulated service garments may rhyme.
 */

/**
 * Builds a small POSIX systemctl shim used only inside the isolated activation fixture.
 *
 * @returns {string} Human-readable shell source for required systemctl operations.
 */
function revealSystemctlShim() {
	return [
		"#!/bin/sh",
		"# B\"H",
		"# Boruch Hashem",
		"# Blessed is He",
		"case \"$1\" in",
		"\tis-active)",
		"\t\texit 0",
		"\t\t;;",
		"\tshow)",
		"\t\tcase \"$4\" in",
		"\t\t\tWorkingDirectory)",
		"\t\t\t\techo \"$TEST_REPO\"",
		"\t\t\t\t;;",
		"\t\t\tExecStart)",
		"\t\t\t\techo \"/usr/bin/node $TEST_REPO/index.js\"",
		"\t\t\t\t;;",
		"\t\t\tEnvironment)",
		"\t\t\t\techo \"$TEST_SERVICE_ENVIRONMENT\"",
		"\t\t\t\t;;",
		"\t\tesac",
		"\t\t;;",
		"\t*)",
		"\t\texit 0",
		"\t\t;;",
		"esac"
	].join("\n");
}

module.exports = {
	revealSystemctlShim
};
