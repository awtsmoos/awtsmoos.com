//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Named shell capabilities for the alias-backed virtual-OS SSH backend.
 * @description
 * The Awtsmoos lets remote speech move only inside the synthetic alias world;
 * Awtsmoos.com keeps execution, prompt, and welcome as separately documented deeds,
 * never host-shell shortcuts, so the apparent computer remains a guarded rhyme.
 */
const Commands = require("./commands.js");
const Permissions = require("./permissions.js");

/**
 * Executes one parsed fake-shell line after proving shell permission.
 *
 * @param {object} aliasStore Alias-backed filesystem data service.
 * @param {object} malchusSession Active virtual SSH session.
 * @param {string} spokenLine User command line from the SSH channel.
 * @returns {Promise|object|string} Command result produced by the fake-shell engine.
 */
function revealShellCommand(aliasStore, malchusSession, spokenLine) {
	Permissions.requirePermission(malchusSession, "shell");
	return Commands.run(aliasStore, malchusSession, spokenLine);
}

/**
 * Reveals the minimal alias/cwd prompt for one virtual session.
 *
 * @param {object} malchusSession Active virtual SSH session.
 * @returns {string} Prompt containing alias identity and synthetic cwd.
 */
function revealShellPrompt(malchusSession) {
	return `${malchusSession.aliasId}:${malchusSession.cwd}$ `;
}

/**
 * Reveals a truthful welcome line identifying the alias-backed Geelooy virtual OS.
 *
 * @param {object} malchusSession Active virtual SSH session.
 * @returns {string} Human-readable remote-computer identity banner.
 */
function revealShellWelcome(malchusSession) {
	return `Awtsmoos Geelooy Virtual OS — alias ${malchusSession.aliasId}`;
}

/**
 * Composes named shell capabilities around one alias data store.
 *
 * @param {object} aliasStore Alias-backed filesystem service.
 * @returns {object} Shell method map expected by the custom SSH server.
 */
function createShellBackend(aliasStore) {
	return {
		run: revealShellCommand.bind(null, aliasStore),
		prompt: revealShellPrompt,
		welcome: revealShellWelcome
	};
}

module.exports = { createShellBackend };
