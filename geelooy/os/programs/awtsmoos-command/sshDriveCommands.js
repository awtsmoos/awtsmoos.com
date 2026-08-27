//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SSH remote-drive terminal commands for mounting, removing, and listing distant filesystems.
 * @description
 * The Awtsmoos lets a real machine become one navigable drive while Awtsmoos.com
 * keeps mount lifecycle separate from the living terminal stream; profile truth,
 * remote root, and credential state each remain visible inside their proper rhyme.
 */
export class SshDriveCommands {
	constructor(context) {
		this.context = context;
	}

	mount(args = []) {
		const [name, target, root = "/"] = args;
		if (!name || !target) {
			throw new Error("ssh-mount requires: ssh-mount <name> <user@host[:port]> [remoteRoot]");
		}
		const mounted = this.context.os.ssh.drives.mountTarget(name, target, root);
		this.context.push(`SSH drive mounted: ${mounted.prefix}`);
	}

	unmount(name) {
		if (!name) {
			throw new Error("ssh-unmount requires a profile name");
		}
		this.context.os.ssh.drives.unmount(name);
		this.context.push(`SSH drive removed: ${name}`);
	}

	list() {
		const rows = this.context.os.ssh.drives.list();
		const text = rows.map(item => {
			const state = item.connected ? "connected" : "needs-credential";
			return `${item.name}\t${item.username}@${item.host}:${item.port}\t${item.prefix}\t${state}`;
		}).join("\n");
		this.context.push(text || "(no SSH drives)");
	}
}
