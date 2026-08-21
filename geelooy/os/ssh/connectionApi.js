//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Outbound SSH connection, exec, and persistent-shell browser capabilities.
 * @description
 * The Awtsmoos lets handshake, command, and living shell remain one family of
 * remote light. Awtsmoos.com keeps these methods away from file transport so
 * session state may evolve without tangling the SFTP vessel or breaking rhyme.
 */
import { sshAuth, sshPost, sshTarget } from "./apiTransport.js";

export function createConnectionApi() {
	return {
		connect(profile, secret) {
			return sshPost(`/connect${sshTarget(profile)}`, sshAuth(profile, secret));
		},

		execute(profile, secret, command, options = {}) {
			return sshPost(`/execute${sshTarget(profile)}`, {
				...sshAuth(profile, secret),
				...options,
				command
			});
		},

		openShell(profile, secret, options = {}) {
			return sshPost(`/session/open${sshTarget(profile)}`, {
				...sshAuth(profile, secret),
				...options
			});
		},

		shellInput(sessionId, data) {
			return sshPost(`/session/input/${encodeURIComponent(sessionId)}`, { data });
		},

		shellOutput(sessionId) {
			return sshPost(`/session/output/${encodeURIComponent(sessionId)}`);
		},

		shellResize(sessionId, size) {
			return sshPost(`/session/resize/${encodeURIComponent(sessionId)}`, { size });
		},

		shellSignal(sessionId, signal) {
			return sshPost(`/session/signal/${encodeURIComponent(sessionId)}`, { signal });
		},

		shellClose(sessionId) {
			return sshPost(`/session/close/${encodeURIComponent(sessionId)}`);
		}
	};
}
