// B"H

const { bool } = require("./normalizers.js");

function closeOldTunnel(context, client, name) {
	const oldClient = context.tunnels.get(name);
	if (!oldClient || oldClient === client) return;
	try {
		oldClient.send({
			type: "TUNNEL_REPLACED",
			name,
			message: "A newer tunnel agent registered with the same tunnel name."
		});
	} catch {}
	try { oldClient.socket.end(); } catch {}
	try { context.clients.delete(oldClient); } catch {}
}

/**
 * B"H — A tunnel name is one living doorway. A new registration closes the
 * older socket before the new vessel is announced, preventing two bodies from
 * answering one name while preserving the public registration contract.
 */
function handleTunnelRegister(context, client, data = {}) {
	const name = String(data.name || "").trim();
	if (!name) return;
	closeOldTunnel(context, client, name);
	Object.assign(client, {
		isTunnel: true,
		tunnelName: name,
		deviceName: data.deviceName || null,
		root: data.root || null,
		allowWrite: bool(data.allowWrite),
		allowSecrets: bool(data.allowSecrets),
		allowCommands: bool(data.allowCommands),
		agentVersion: data.agentVersion || null,
		tools: data.tools || null,
		chrome: data.chrome || null,
		command: data.command || null,
		vesselType: data.vesselType || data.kind || null,
		kind: data.kind || data.vesselType || null,
		registeredAt: Date.now()
	});
	context.tunnels.set(name, client);
	client.send({ type: "TUNNEL_ACK", ok: true, name, replacedOlderConnection: true });
}

module.exports = { closeOldTunnel, handleTunnelRegister };
