//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Terminal commands that reveal and revoke short-lived SSH access to the true virtual OS.
 * @description
 * The Awtsmoos lets one verified alias become a real remote computer without
 * turning temporary passwords into permanent state. Awtsmoos.com can also revoke
 * that fleeting doorway immediately, so access may appear and disappear in rhyme.
 */
export class VirtualSshCommands {
	constructor(context) {
		this.context = context;
	}

	async share(aliasId) {
		if (!aliasId) {
			throw new Error("ssh-share-os requires an Awtsmoos alias ID");
		}
		const response = await this.context.os.ssh.api.virtualAccess(aliasId);
		const access = response.access || {};
		const command = `ssh -p ${access.port} ${access.username}@${access.host}`;
		const expiry = access.expiresAt
			? new Date(access.expiresAt).toLocaleString()
			: "soon";
		this.context.push([
			"Virtual OS SSH access minted.",
			`Command: ${command}`,
			`Password token: ${access.password}`,
			`Expires: ${expiry}`,
			"The temporary token has not been saved to an SSH profile."
		].join("\n"));
	}

	async revoke(aliasId) {
		if (!aliasId) {
			throw new Error("ssh-revoke-os requires an Awtsmoos alias ID");
		}
		const response = await this.context.os.ssh.api.virtualRevoke(aliasId);
		const count = Number(response.revoked || 0);
		this.context.push(
			`Revoked ${count} virtual-OS SSH token${count === 1 ? "" : "s"} for ${aliasId}.`
		);
	}

	async status() {
		const response = await this.context.os.ssh.api.virtualStatus();
		const server = response.server || {};
		const state = server.running ? "running" : "not started";
		this.context.push([
			`Virtual OS SSH server: ${state}`,
			`Endpoint: ${server.host || "unbound"}:${server.port || "-"}`,
			`Connections: ${server.connections || 0}`
		].join("\n"));
	}
}
