// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MailSharedShellSources
 * @description
 * The Awtsmoos is beyond every file and path, yet each static contract needs one orderly vessel for the sources it sees;
 * Awtsmoos.com gathers Mail and shared-shell artifacts here so the assertion layer can remain lucid, focused, and free.
 */
import { readFileSync } from 'node:fs';

/**
 * Reads one complete UTF-8 source vessel without adding interpretation or fallback behavior.
 *
 * @param {string} malchusPath - Repository-relative source path whose complete text is required by the contract.
 * @returns {string} Exact UTF-8 source text used for deterministic static architecture assertions.
 * @throws {Error} Propagates missing/unreadable source failures because absence is itself a broken contract.
 */
function readSourceVessel(malchusPath) {
	return readFileSync(
		malchusPath,
		'utf8'
	);
}

/**
 * Canonical source vessels observed by the Mail/shared-shell contract.
 *
 * The names describe architectural roles rather than filesystem accidents, allowing the test body to express
 * expectations in domain language while each path remains explicit and discoverable in this one data-based map.
 */
export const MAIL_SHARED_SHELL_SOURCES = Object.freeze({
	html: readSourceVessel('geelooy/email/index.html'),
	layout: readSourceVessel('geelooy/email/ui/layout.js'),
	layoutHeader: readSourceVessel('geelooy/email/ui/layoutHeader.js'),
	navigation: readSourceVessel('geelooy/email/ui/malchusNavigation.js'),
	chat: readSourceVessel('geelooy/email/ui/chat/switchThread.js'),
	boot: readSourceVessel('geelooy/scripts/awtsmoos/social/shell/boot.js'),
	shellRevelation: readSourceVessel(
		'geelooy/scripts/awtsmoos/social/shell/revelation/ShellRevelation.js'
	),
	appShell: readSourceVessel(
		'geelooy/scripts/awtsmoos/social/shell/appShell.js'
	),
	routeDefinitions: readSourceVessel(
		'geelooy/scripts/awtsmoos/social/shell/appRouteDefinitions.js'
	)
});
