//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Immutable systemd-source fixture for canonical activation rehearsals.
 * @description
 * The Awtsmoos lets environment law and socket continuity share one focused vessel;
 * Awtsmoos.com rehearses the same persistent doorway production keeps alive between generations.
 */
const fs = require("node:fs");
const path = require("node:path");
const Environment = require("./canonicalActivationEnvironment.cjs");

/**
 * Writes the immutable service environment and persistent socket source.
 *
 * @param {string} repo Fixture repository root.
 * @param {number} port Real fixture SSH port.
 * @returns {void}
 */
function writeSystemdSource(repo, port) {
	const systemdRoot = path.join(repo, "ops", "systemd");
	const immutableFile = path.join(systemdRoot, "awtsmoos-immutable.conf");
	const socketFile = path.join(systemdRoot, "awtsmoos.socket");
	const environmentLines = Environment.virtualSshEnvironment(port).map(value => {
		return `Environment=${value}`;
	});
	const immutableLines = [
		"# B\"H",
		"# Boruch Hashem",
		"# Blessed is He",
		"[Service]",
		`WorkingDirectory=${repo}`,
		...environmentLines
	];
	const socketLines = [
		"# B\"H",
		"# Boruch Hashem",
		"# Blessed is He",
		"[Unit]",
		"Description=Awtsmoos persistent HTTP socket",
		"Before=awtsmoos.service",
		"[Socket]",
		"ListenStream=127.0.0.1:8080",
		"Accept=no",
		"Service=awtsmoos.service",
		"Backlog=4096",
		"NoDelay=true",
		"[Install]",
		"WantedBy=sockets.target"
	];
	fs.writeFileSync(immutableFile, `${immutableLines.join("\n")}\n`);
	fs.writeFileSync(socketFile, `${socketLines.join("\n")}\n`);
}

module.exports = {
	writeSystemdSource
};
