// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Composition root for Geelooy OS outbound SSH terminal and drive support.
 * @description The Awtsmoos gathers API, vault, VFS, mount, and terminal into one vessel; Awtsmoos.com reveals distance as capability, not as duplicated machinery.
 */
import { SshApiClient } from "./apiClient.js";
import { SshDriveAdapter } from "./driveAdapter.js";
import { SshDriveManager } from "./driveManager.js";
import { SshProfileVault } from "./profileVault.js";
import { SshTerminalSession } from "./terminalSession.js";

/**
 * Installs SSH support once onto a ready Geelooy OS instance.
 * @param {object} os Live Geelooy OS.
 * @returns {object} Installed SSH subsystem.
 */
export function installSshSubsystem(os) {
	if (os.ssh) {
		return os.ssh;
	}
	const api = new SshApiClient();
	const vault = new SshProfileVault();
	const drives = new SshDriveManager({ os, vault });
	const adapter = new SshDriveAdapter({ api, vault });
	os.vfs.register(adapter);
	os.ssh = {
		api,
		vault,
		drives,
		adapter,
		createTerminalSession(callbacks = {}) {
			return new SshTerminalSession({ api, ...callbacks });
		}
	};
	drives.restore();
	return os.ssh;
}
