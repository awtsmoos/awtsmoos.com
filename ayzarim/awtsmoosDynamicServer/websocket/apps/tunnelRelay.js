
// B"H
function bool(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function handleTunnelRegister(ctx, client, data) {
  client.isTunnel = true;
  client.tunnelName = data.name;
  client.deviceName = data.deviceName || null;
  client.root = data.root || null;
  client.allowWrite = bool(data.allowWrite);
  client.allowSecrets = bool(data.allowSecrets);
  client.allowCommands = bool(data.allowCommands);
  client.agentVersion = data.agentVersion || null;
  client.tools = data.tools || null;
  client.chrome = data.chrome || null;
  client.command = data.command || null;
  client.registeredAt = Date.now();

  ctx.tunnels.set(data.name, client);

  client.send({
    type: "TUNNEL_ACK",
    name: data.name,
    ok: true
  });
}

function handleTunnelResponse(ctx, data) {
  const pending = ctx.pendingTunnelRequests.get(data.id);
  if (!pending) return;

  ctx.pendingTunnelRequests.delete(data.id);
  pending.resolve(data);
}

function sendTunnelRequest(ctx, name, payload, timeout = 30000) {
  const tunnel = ctx.tunnels.get(name);

  if (!tunnel) return Promise.reject(new Error("No tunnel connected: " + name));

  const id = Date.now() + "_" + Math.random().toString(36).slice(2);

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ctx.pendingTunnelRequests.delete(id);
      reject(new Error("Tunnel timeout"));
    }, timeout);

    ctx.pendingTunnelRequests.set(id, {
      resolve: data => {
        clearTimeout(timer);
        resolve(data);
      },
      reject
    });

    tunnel.send({
      type: "TUNNEL_REQUEST",
      id,
      payload
    });
  });
}

module.exports = {
  handleTunnelRegister,
  handleTunnelResponse,
  sendTunnelRequest
};
