//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Outbound SSH handshake, exec, and persistent-shell opening API.
 * @description
 * The Awtsmoos lets a distant host first become reachable, then executable, then alive
 * as a shell. Awtsmoos.com keeps those three command-world deeds explicit while validated
 * authentication wins over terminal options and each Internet crossing stays bounded in rhyme.
 */
import { sshAuth, sshPost, sshTarget } from "./apiTransport.js";

/**
 * Creates the command-facing methods mixed into the public SSH client.
 *
 * @description
 * The Awtsmoos gathers related deeds without binding hidden mutable state; Awtsmoos.com
 * returns named functions whose contracts remain directly testable and readable.
 *
 * @returns {{connect:Function,execute:Function,openShell:Function}} Command API methods.
 */
export function createCommandApi() {
	return {
		connect,
		execute,
		openShell
	};
}

/**
 * Verifies that a validated SSH identity and ephemeral credential can establish a session.
 *
 * @description
 * Yesod opens a measured doorway without retaining the secret after the request settles;
 * Awtsmoos.com lets callers cancel or shorten the journey through transport options.
 *
 * @param {object} profile Remote SSH host, username, and optional port identity.
 * @param {object} secret Ephemeral password or private-key authentication material.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Server connection-verification payload.
 */
export function connect(profile, secret, requestOptions = {}) {
	return sshPost(
		`/connect${sshTarget(profile)}`,
		sshAuth(profile, secret),
		requestOptions
	);
}

/**
 * Executes one remote command using validated authentication and explicit command options.
 *
 * @description
 * The Awtsmoos lets command intention clothe the session without letting optional fields
 * replace validated credentials; Awtsmoos.com keeps command text last and identity sovereign.
 *
 * @param {object} profile Remote SSH host, username, and optional port identity.
 * @param {object} secret Ephemeral password or private-key authentication material.
 * @param {string} command Remote command text sent to the SSH server.
 * @param {object} [options={}] Existing server command options such as PTY or environment controls.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Remote execution result envelope.
 */
export function execute(profile, secret, command, options = {}, requestOptions = {}) {
	return sshPost(`/execute${sshTarget(profile)}`, {
		...options,
		...sshAuth(profile, secret),
		command
	}, requestOptions);
}

/**
 * Opens one persistent remote shell whose later I/O is addressed by session ID.
 *
 * @description
 * The Awtsmoos reveals a living remote channel while validated authentication remains
 * stronger than optional shell garments; Awtsmoos.com returns the session identity for rhyme.
 *
 * @param {object} profile Remote SSH host, username, and optional port identity.
 * @param {object} secret Ephemeral password or private-key authentication material.
 * @param {object} [options={}] Existing server shell options such as terminal geometry.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Persistent-shell session envelope.
 */
export function openShell(profile, secret, options = {}, requestOptions = {}) {
	return sshPost(`/session/open${sshTarget(profile)}`, {
		...options,
		...sshAuth(profile, secret)
	}, requestOptions);
}
