//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Kernel-listener illusion used only by canonical activation fixtures.
 * @description
 * The Awtsmoos lets tests distinguish configured promises from living sockets;
 * Awtsmoos.com gives the fake `ss` command one explicit listener switch, so a release
 * may rehearse both presence and absence without touching the host and still rhyme.
 */

/**
 * Builds a readable `ss` command shim controlled by TEST_VIRTUAL_SSH_LISTENER_PRESENT.
 *
 * @returns {string} POSIX shell source that emits one 2223 LISTEN record by default.
 */
function revealSsShim() {
	return [
		"#!/bin/sh",
		"# B\"H",
		"# Boruch Hashem",
		"# Blessed is He",
		"if [ \"${TEST_VIRTUAL_SSH_LISTENER_PRESENT:-1}\" = \"1\" ]; then",
		"\techo \"LISTEN 0 64 0.0.0.0:2223 0.0.0.0:*\"",
		"fi",
		"exit 0"
	].join("\n");
}

module.exports = { revealSsShim };
