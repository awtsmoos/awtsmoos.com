//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Lifecycle manager for connected and remembered SSH remote drives.
 * @description
 * The Awtsmoos lets a distant doorway remain visible after its temporary key
 * disappears. Awtsmoos.com marks that remembered world locked until new secret
 * light is verified, so capability and presentation speak one truth in rhyme.
 */
import { parseSshTarget } from "./profileVault.js";
import { sshMountPrefix } from "./remotePath.js";

const CAPABILITIES = [
	"children",
	"read",
	"write",
	"delete",
	"move",
	"copy",
	"terminal"
];

export class SshDriveManager {
	constructor({ os, vault } = {}) {
		this.os = os;
		this.vault = vault;
	}

	mountTarget(name, target, root = "/") {
		const profile = parseSshTarget(target, name);
		profile.root = String(root || "/");
		const saved = this.vault.save(profile);
		this.vault.ensureSecret(saved);
		return this.mountProfile(saved);
	}

	mountProfile(profile) {
		const prefix = sshMountPrefix(profile.name);
		const connected = Boolean(this.vault.secret(profile.name));
		const state = connected ? "connected" : "needs-credential";
		const permissions = accessPermissions(connected);
		this.os.vfs.mount({
			id: `mount:ssh:${profile.name}`,
			prefix,
			adapterId: "ssh",
			provider: "ssh",
			title: `${profile.username}@${profile.host}`,
			icon: "🔐",
			capabilities: CAPABILITIES,
			permissions,
			connected,
			connectionState: state,
			permissionState: connected ? "read-write" : "locked",
			data: {
				profileName: profile.name,
				remoteRoot: profile.root
			}
		});
		this.os.drives.mount({
			id: `ssh:${profile.name}`,
			root: prefix,
			provider: "ssh",
			providerId: profile.name,
			title: `${profile.username}@${profile.host}`,
			icon: "🔐",
			capabilities: CAPABILITIES,
			connected,
			connectionState: state,
			permissionState: connected ? "read-write" : "locked",
			sshProfile: profile.name
		});
		return { profile, prefix, connected };
	}

	restore() {
		return this.vault.list().map(profile => this.mountProfile(profile));
	}

	unmount(name, { forget = true } = {}) {
		const profile = this.vault.get(name);
		const key = profile?.name || name;
		this.os.vfs.unmount(`mount:ssh:${key}`);
		this.os.drives.unmount(`ssh:${key}`);
		if (forget) {
			this.vault.remove(key);
		}
		return { name: key, removed: true };
	}

	list() {
		return this.vault.list().map(profile => ({
			...profile,
			prefix: sshMountPrefix(profile.name),
			connected: Boolean(this.vault.secret(profile.name))
		}));
	}
}

function accessPermissions(connected) {
	return {
		read: connected,
		write: connected,
		delete: connected,
		list: connected
	};
}
